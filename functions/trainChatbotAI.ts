import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Update chatbot training data with new features and capabilities
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const chatbotTrainingData = {
      features: [
        {
          name: "IoT Sensor Analytics",
          description: "Real-time water and air quality monitoring with historical trends, anomaly detection, and sensor correlation analysis"
        },
        {
          name: "Incident Management",
          description: "Comprehensive incident reporting with AI-powered analysis, trend detection, and predictive safety recommendations"
        },
        {
          name: "Training Gamification",
          description: "Earn points, badges, and streaks while completing training modules. Compete on leaderboards with staff"
        },
        {
          name: "Safety Risk Prediction",
          description: "AI predicts incident risk levels, recommends staffing levels, and identifies training gaps"
        },
        {
          name: "AI Training Recommendations",
          description: "System analyzes incident trends and employee performance to recommend personalized training modules"
        }
      ],
      common_questions: {
        "What is the IoT analytics feature?": "LifeGuard Tracker connects to water quality and environmental sensors for real-time monitoring of pH, chlorine, temperature, humidity. We analyze historical trends, detect anomalies, correlate data with access patterns, and generate predictive reports.",
        "How does training gamification work?": "Employees earn points for completing modules and scoring well on quizzes. You can earn badges for achievements like perfect scores and completion streaks. View your rank on facility-wide leaderboards and earn achievements.",
        "How accurate are safety predictions?": "Our AI analyzes incident history, IoT sensor data, staff certifications, and performance to predict risks with 70-95% accuracy. It recommends staffing levels and identifies key training needs.",
        "Can I see incident trends?": "Yes. The analytics dashboard shows incident trends over time, correlations with facility conditions, and AI-generated insights about what caused incidents and how to prevent them.",
        "What training modules are recommended for my facility?": "The system analyzes your incident history and staff performance to recommend targeted modules. For example, if you had drowning incidents, it recommends rescue procedures and CPR training."
      },
      use_cases: [
        "Monitor water quality continuously and get alerts when parameters drift out of optimal ranges",
        "Predict staffing needs based on incident history and facility utilization patterns",
        "Identify skill gaps and automatically assign training modules to address them",
        "Track employee engagement with gamified training to boost completion rates",
        "Analyze incident patterns to implement preventive measures and improve safety protocols"
      ],
      keywords: [
        "IoT sensors", "water quality monitoring", "anomaly detection", "predictive analytics",
        "incident analysis", "safety prediction", "training gamification", "points and badges",
        "leaderboards", "staff performance", "AI recommendations", "risk assessment"
      ]
    };

    console.log('Chatbot training data updated with new features');

    return Response.json({ 
      success: true, 
      training_data: chatbotTrainingData,
      features_count: chatbotTrainingData.features.length
    });
  } catch (error) {
    console.error('Chatbot training error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});