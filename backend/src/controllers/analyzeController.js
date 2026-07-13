import pdfParse from 'pdf-parse';
import prisma from '../config/db.js';
import { analyzeResumeWithAI } from '../utils/aiAnalyzer.js';

/**
 * Handle uploading, parsing, and analyzing a PDF resume.
 */
export async function analyzeResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF resume file' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are supported' });
    }

    const { jobDescription } = req.body;

    // Parse PDF text from Buffer
    let pdfData;
    try {
      pdfData = await pdfParse(req.file.buffer);
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      return res.status(400).json({ error: 'Failed to extract text from the PDF file' });
    }

    const resumeText = pdfData.text;
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'The uploaded PDF appears to be empty or image-only' });
    }

    // Call dynamic AI analyzer engine
    const provider = process.env.AI_PROVIDER || 'gemini';
    const model = process.env.AI_MODEL_NAME || (provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini');

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
      missingKeywords
    } = analysisResult;

    if (atsScore === undefined || !strengths || !weaknesses || !shortlistProbability || !structuralImprovements || !missingKeywords) {
      console.error('AI response did not conform to schema:', analysisResult);
      return res.status(502).json({ error: 'AI analysis returned an invalid JSON response structure' });
    }

    // Save metadata and results in database
    const savedAnalysis = await prisma.resumeAnalysis.create({
      data: {
        userId: req.user.userId,
        fileName: req.file.originalname,
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
