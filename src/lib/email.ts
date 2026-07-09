export async function sendInviteEmail(to: string, workspaceName: string, inviteUrl: string) {
  // In a real application, you would use Resend, SendGrid, or Nodemailer here.
  // For now, we mock the email sending process.
  console.log(`
    ===========================================
    MOCK EMAIL
    To: ${to}
    Subject: You've been invited to join ${workspaceName}
    
    Hi there,
    
    You have been invited to collaborate on ${workspaceName}.
    Please click the link below to accept the invitation:
    
    ${inviteUrl}
    
    ===========================================
  `);

  return { success: true };
}
