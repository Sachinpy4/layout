/**
 * PDF Delivery Service
 * 
 * Handles the delivery of PDFs via different channels:
 * - Email
 * - WhatsApp
 */

import { Request, Response } from 'express';
import { join } from 'path';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import axios from 'axios';
import { getEmailTransporter } from '../config/email.config';

// WhatsApp configuration
const whatsappApiUrl = process.env.WHATSAPP_API_URL;
const whatsappApiToken = process.env.WHATSAPP_API_TOKEN;

/**
 * Sanitize filename to ensure it's safe for file system operations
 * Replaces characters that are problematic in filenames
 */
const sanitizeFilename = (filename: string): string => {
  // Replace slashes, backslashes, colons, and other invalid filename characters
  return filename.replace(/[\/\\:*?"<>|]/g, '_');
};

/**
 * Send a PDF via email
 */
export const sendPdfByEmail = async (
  pdfBuffer: Buffer,
  recipientEmail: string,
  subject: string,
  message: string,
  filename: string
): Promise<boolean> => {
  let tempFilePath = '';
  try {
    console.log(`[INFO] Attempting to send email to ${recipientEmail} with subject: ${subject}`);
    
    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), 'temp');
    if (!existsSync(tempDir)) {
      console.log(`[DEBUG] Creating temp directory at ${tempDir}`);
      mkdirSync(tempDir, { recursive: true });
    }
    
    // Sanitize filename to avoid path issues
    const safeFilename = sanitizeFilename(filename);
    console.log(`[DEBUG] Original filename: ${filename}, Sanitized: ${safeFilename}`);
    
    // Generate a temporary file path with unique identifier
    const timestamp = Date.now();
    tempFilePath = join(tempDir, `temp-${timestamp}-${safeFilename}`);
    
    console.log(`[DEBUG] Writing PDF to temporary file: ${tempFilePath}`);
    
    // Write the PDF to a temporary file
    writeFileSync(tempFilePath, pdfBuffer);
    console.log(`[DEBUG] Successfully wrote ${pdfBuffer.length} bytes to temporary file`);
    
    // Get the email transporter
    console.log(`[DEBUG] Getting email transporter`);
    const { transporter, isTestMode, getTestMessageUrl } = await getEmailTransporter();
    
    // Log email configuration (without sensitive details)
    console.log(`[DEBUG] Email mode: ${isTestMode ? 'Test' : 'Production'}`);
    console.log(`[DEBUG] SMTP Host: ${process.env.SMTP_HOST || 'Not configured'}`);
    
    // Send the email
    console.log(`[DEBUG] Sending email to: ${recipientEmail}`);
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER || '"Exhibition Management" <no-reply@exhibition-management.com>',
      to: recipientEmail,
      subject: subject,
      text: message,
      attachments: [
        {
          filename: filename, // Use original filename for email attachment
          path: tempFilePath,
        },
      ],
    });
    
    console.log(`[INFO] Email sent successfully. Message ID: ${info.messageId}`);
    
    // Log test message URL if in test mode
    if (isTestMode && getTestMessageUrl) {
      console.log(`[INFO] Preview URL: ${getTestMessageUrl(info)}`);
    }
    
    // Clean up the temporary file
    console.log(`[DEBUG] Cleaning up temporary file: ${tempFilePath}`);
    unlinkSync(tempFilePath);
    
    return true;
  } catch (error) {
    console.error('[ERROR] Failed to send PDF by email:', error);
    
    // Add more detailed error information
    if (error instanceof Error) {
      console.error(`[ERROR] Error message: ${error.message}`);
      console.error(`[ERROR] Stack trace: ${error.stack}`);
    }
    
    // Check if temp file exists and remove it
    try {
      if (tempFilePath && existsSync(tempFilePath)) {
        console.log(`[DEBUG] Cleaning up temporary file after error: ${tempFilePath}`);
        unlinkSync(tempFilePath);
      }
    } catch (cleanupErr) {
      console.error('[ERROR] Failed to clean up temporary file:', cleanupErr);
    }
    
    return false;
  }
};

/**
 * Send a PDF via WhatsApp
 */
export const sendPdfByWhatsApp = async (
  pdfBuffer: Buffer,
  phoneNumber: string,
  message: string,
  pdfUrl: string
): Promise<boolean> => {
  try {
    if (!whatsappApiUrl || !whatsappApiToken) {
      throw new Error('WhatsApp API configuration missing');
    }
    
    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), 'temp');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    
    // Send message with PDF URL
    await axios.post(whatsappApiUrl, {
      phone: phoneNumber,
      message: `${message}: ${pdfUrl}`,
    }, {
      headers: {
        'Authorization': `Bearer ${whatsappApiToken}`
      }
    });
    
    return true;
  } catch (error) {
    console.error('[ERROR] Failed to send PDF by WhatsApp:', error);
    return false;
  }
}; 