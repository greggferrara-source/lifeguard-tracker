import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { trigger_type, user_email, user_name, trigger_data } = await req.json();
    
    if (!user_email) {
      return Response.json({ error: 'User email required' }, { status: 400 });
    }

    let emailSubject = '';
    let emailBody = '';

    switch (trigger_type) {
      case 'download_whitepaper':
        emailSubject = `Exclusive: Advanced ${trigger_data?.topic || 'Pool Management'} Guide`;
        emailBody = `
          <h2>Thank you for downloading our whitepaper!</h2>
          <p>Hi ${user_name || 'there'},</p>
          <p>We've sent the whitepaper you requested about ${trigger_data?.topic || 'pool management'} to your email.</p>
          <p>Here are some resources to help you get started:</p>
          <ul>
            <li><a href="https://lifeguardtracker.com/docs">Complete Documentation</a></li>
            <li><a href="https://lifeguardtracker.com/tutorials">Video Tutorials</a></li>
            <li><a href="https://lifeguardtracker.com/schedule-demo">Schedule a Demo</a></li>
          </ul>
          <p>Questions? Reply to this email or chat with our team on the site.</p>
        `;
        break;

      case 'trial_started':
        emailSubject = 'Welcome to LifeGuard Tracker! 🎉';
        emailBody = `
          <h2>Your 14-day free trial is live!</h2>
          <p>Hi ${user_name || 'there'},</p>
          <p>You now have full access to all LifeGuard Tracker features:</p>
          <ul>
            <li>✅ Smart scheduling for all your lifeguards</li>
            <li>✅ Real-time compliance tracking</li>
            <li>✅ Advanced reporting and analytics</li>
            <li>✅ GPS verification and time tracking</li>
            <li>✅ Full customer support</li>
          </ul>
          <p><a href="https://lifeguardtracker.com/dashboard">Go to Dashboard</a></p>
          <p>Need help? <a href="https://lifeguardtracker.com/contact">Contact us</a> - we're here to help!</p>
        `;
        break;

      case 'trial_day_3':
        emailSubject = 'Let\'s get you started with LifeGuard Tracker';
        emailBody = `
          <h2>3 days into your trial — let's make the most of it!</h2>
          <p>Hi ${user_name || 'there'},</p>
          <p>You've signed up for LifeGuard Tracker. Ready to see how easy scheduling can be?</p>
          <p><strong>Quick Start Guide:</strong></p>
          <ol>
            <li>Add your first location</li>
            <li>Import your staff or add them manually</li>
            <li>Build your first schedule</li>
          </ol>
          <p><a href="https://lifeguardtracker.com/dashboard">Get Started</a> | <a href="https://lifeguardtracker.com/tutorials">Watch Tutorials</a></p>
        `;
        break;

      case 'trial_day_10':
        emailSubject = 'Don\'t miss out — your trial ends in 4 days';
        emailBody = `
          <h2>Make scheduling easier before your trial ends</h2>
          <p>Hi ${user_name || 'there'},</p>
          <p>In 4 days, your LifeGuard Tracker trial ends. Here's what you can do:</p>
          <ul>
            <li>Schedule your team for the next 3 months</li>
            <li>Set up compliance tracking</li>
            <li>Integrate with your payroll system</li>
          </ul>
          <p>Ready to continue? <strong>Choose your plan:</strong></p>
          <ul>
            <li>Starter: $29/month — Scheduling basics</li>
            <li>Pro: $149/month — Full compliance + integrations</li>
            <li>Enterprise: Custom pricing — Multi-location + AI advisor</li>
          </ul>
          <p><a href="https://lifeguardtracker.com/pricing">View Pricing</a></p>
        `;
        break;

      case 'abandoned_checkout':
        emailSubject = 'Your LifeGuard Tracker subscription is waiting for you';
        emailBody = `
          <h2>You're one click away!</h2>
          <p>Hi ${user_name || 'there'},</p>
          <p>You started setting up a ${trigger_data?.plan || 'Pro'} plan subscription but didn't complete it.</p>
          <p><strong>Complete your order:</strong></p>
          <p><a href="${trigger_data?.checkout_url || 'https://lifeguardtracker.com/pricing'}">Finish Checkout</a></p>
          <p><strong>Having trouble?</strong> Here are some common questions:</p>
          <ul>
            <li>All plans include unlimited staff — no per-user fees</li>
            <li>Cancel anytime with no penalty</li>
            <li>14-day free trial available if you haven't started yet</li>
          </ul>
          <p>Still have questions? <a href="https://lifeguardtracker.com/contact">Contact our team</a></p>
        `;
        break;

      case 'feature_education':
        emailSubject = `Pro Tip: Get more from LifeGuard Tracker — ${trigger_data?.feature || 'GPS Tracking'}`;
        emailBody = `
          <h2>Did you know? You can ${trigger_data?.action || 'use GPS to verify lifeguard positions'}!</h2>
          <p>Hi ${user_name || 'there'},</p>
          <p>Many LifeGuard Tracker customers are using ${trigger_data?.feature || 'GPS tracking'} to:</p>
          <ul>
            ${trigger_data?.benefits ? trigger_data.benefits.map(b => `<li>${b}</li>`).join('') : '<li>Improve accountability</li><li>Ensure proper zone coverage</li><li>Streamline clock-in verification</li>'}
          </ul>
          <p><a href="https://lifeguardtracker.com/docs/${trigger_data?.doc_path || 'gps-tracking'}">Learn How</a></p>
        `;
        break;

      default:
        return Response.json({ error: 'Unknown trigger type' }, { status: 400 });
    }

    // Send email via Gmail connector if authorized, else use Core SendEmail
    try {
      await base44.integrations.Core.SendEmail({
        to: user_email,
        subject: emailSubject,
        body: emailBody
      });

      // Log the email send
      console.log(`Email sent: ${trigger_type} to ${user_email}`);

      return Response.json({ 
        success: true, 
        message: 'Email sent successfully',
        trigger: trigger_type,
        email: user_email
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      return Response.json({ error: 'Failed to send email: ' + emailError.message }, { status: 500 });
    }

  } catch (error) {
    console.error('Marketing trigger error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});