import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import prisma from '../config/db.js';
import { analyzeResumeWithAI } from '../utils/aiAnalyzer.js';

/**
 * Strips HTML tags, scripts, styles, and extracts readable text.
 */
function extractTextFromHtml(html) {
  // 1. Remove script and style elements
  let text = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  // 2. Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  // 3. Replace common block tags with newlines
  text = text.replace(/<\/p>|<\/div>|<\/h1>|<\/h2>|<\/h3>|<\/h4>|<\/h5>|<\/h6>|<\/li>|<\/tr>/g, '\n');
  // 4. Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // 5. Unescape HTML entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"');
  // 6. Clean up white spaces and lines
  text = text.split('\n')
             .map(line => line.trim())
             .filter(line => line.length > 0)
             .join('\n');
  return text;
}

/**
 * Handle uploading, parsing (PDF/Image OCR/URL Scraper), and analyzing a resume.
 */
export async function analyzeResume(req, res) {
  try {
    const { jobDescription, rawResumeText, portfolioUrl } = req.body;
    let resumeText = '';
    let fileName = 'Portfolio Link Analysis';

    if (req.file) {
      const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Only standard PDF, JPG, JPEG, and PNG files are supported' });
      }
      
      fileName = req.file.originalname;

      if (req.file.mimetype.startsWith('image/')) {
        // Image Processing: Extract characters via Tesseract OCR
        console.log(`[OCR] Executing text extraction on image: ${fileName}`);
        try {
          const ocrResult = await Tesseract.recognize(
            req.file.buffer,
            'eng'
          );
          resumeText = ocrResult.data.text;
        } catch (ocrError) {
          console.error('Tesseract OCR failed:', ocrError);
          return res.status(502).json({ error: 'OCR engine failed to scan text from this image' });
        }
      } else {
        // PDF Processing: Extract vector text layers
        let pdfData;
        try {
          pdfData = await pdfParse(req.file.buffer);
        } catch (parseError) {
          console.error('PDF parsing error:', parseError);
          return res.status(400).json({ error: 'Failed to extract text from the PDF file' });
        }
        resumeText = pdfData.text;
      }
    } else if (portfolioUrl && portfolioUrl.trim().length > 0) {
      // URL Scraping Ingestion
      let targetUrl = portfolioUrl.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = `https://${targetUrl}`;
      }

      try {
        fileName = new URL(targetUrl).hostname;
      } catch (_) {
        return res.status(400).json({ error: 'Invalid portfolio website link format' });
      }

      console.log(`[Scraper] Fetching text vectors from: ${targetUrl}`);
      try {
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (!response.ok) {
          return res.status(400).json({ error: `Target URL returned server error: ${response.status}` });
        }
        const html = await response.text();
        resumeText = extractTextFromHtml(html);
      } catch (scrapeError) {
        console.error('Web scraper connection failed:', scrapeError);
        return res.status(400).json({ error: 'Web crawler failed to connect. Make sure the website is public and active.' });
      }
    } else if (rawResumeText && rawResumeText.trim().length > 0) {
      resumeText = rawResumeText;
    } else {
      return res.status(400).json({ error: 'Please upload a PDF/Image, paste text, or provide a portfolio link.' });
    }

    // Verify extracted/scraped text is not empty
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ 
        error: 'No readable text could be found in the provided resume source. Please try copying and pasting it.' 
      });
    }

    // Call dynamic AI analyzer engine
    const provider = process.env.AI_PROVIDER || 'gemini';
    const model = process.env.AI_MODEL_NAME || (provider === 'gemini' ? 'gemini-3.5-flash' : 'gpt-4o-mini');

    let analysisResult;
    try {
      analysisResult = await analyzeResumeWithAI(resumeText, jobDescription);
    } catch (aiError) {
      console.error('AI Analysis error:', aiError);
      return res.status(502).json({ error: `AI analysis failed: ${aiError.message}` });
    }

    // Validate structure of response
    const {
      atsScore,
      strengths,
      weaknesses,
      shortlistProbability,
      structuralImprovements,
      missingKeywords,
      redFlags,
      quantifiableImpactScore
    } = analysisResult;

    if (
      atsScore === undefined || 
      !strengths || 
      !weaknesses || 
      !shortlistProbability || 
      !structuralImprovements || 
      !missingKeywords || 
      !redFlags || 
      quantifiableImpactScore === undefined
    ) {
      console.error('AI response did not conform to schema:', analysisResult);
      return res.status(502).json({ error: 'AI analysis returned an invalid JSON response structure' });
    }

    // Save metadata and results in database
    const savedAnalysis = await prisma.resumeAnalysis.create({
      data: {
        userId: req.user.userId,
        fileName: fileName,
        atsScore: parseInt(atsScore, 10),
        targetJobDescription: jobDescription || null,
        strengths: strengths,
        weaknesses: weaknesses,
        shortlistProbability: shortlistProbability,
        structuralImprovements: structuralImprovements,
        missingKeywords: missingKeywords,
        rawAiResponse: JSON.stringify(analysisResult),
        providerUsed: provider,
        modelUsed: model
      }
    });

    res.status(201).json(savedAnalysis);
  } catch (error) {
    console.error('Analyze controller error:', error);
    res.status(500).json({ error: 'Internal server error during resume analysis' });
  }
}

/**
 * Get all historical analyses for the current authenticated user.
 */
export async function getUserAnalyses(req, res) {
  try {
    const analyses = await prisma.resumeAnalysis.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(analyses);
  } catch (error) {
    console.error('Fetch analyses error:', error);
    res.status(500).json({ error: 'Internal server error while fetching analyses' });
  }
}

/**
 * Get details of a single analysis run by ID.
 */
export async function getAnalysisById(req, res) {
  try {
    const { id } = req.params;
    const analysis = await prisma.resumeAnalysis.findUnique({
      where: { id }
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (analysis.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to view this analysis' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Fetch single analysis error:', error);
    res.status(500).json({ error: 'Internal server error while fetching analysis details' });
  }
}

/**
 * Delete a single resume analysis record by ID.
 */
export async function deleteAnalysisById(req, res) {
  try {
    const { id } = req.params;
    const analysis = await prisma.resumeAnalysis.findUnique({
      where: { id }
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis record not found' });
    }

    if (analysis.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this analysis record' });
    }

    await prisma.resumeAnalysis.delete({
      where: { id }
    });

    res.json({ message: 'Analysis record deleted successfully' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ error: 'Internal server error while deleting analysis record' });
  }
}
