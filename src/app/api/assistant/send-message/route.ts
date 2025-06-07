import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get user session for authentication
    const session = await getServerSession(authOptions);
    
    // Parse request body
    const { message, userId } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Basic validation
    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Simple chatbot logic (you can replace this with AI service integration)
    const reply = generateBotReply(message);

    // Here you could also:
    // 1. Store the conversation in your database
    // 2. Call an external AI service (OpenAI, Claude, etc.)
    // 3. Forward to human support if needed
    // 4. Log the interaction for analytics

    return NextResponse.json({
      reply,
      timestamp: new Date().toISOString(),
      status: 'success'
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simple rule-based chatbot responses (replace with AI service)
function generateBotReply(message: string): string {
  const lowerMessage = message.toLowerCase().trim();
  
  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm here to help you with Scaffold Your Shape. What can I assist you with today?";
  }
  
  // Help with app features
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
    return "I can help you with our workout features! You can create personalized workout plans, track your activities, and monitor your progress. Would you like to know more about any specific feature?";
  }
  
  if (lowerMessage.includes('club') || lowerMessage.includes('community')) {
    return "Great question about our community features! You can join or create fitness clubs to connect with other users, share your progress, and participate in group challenges. Would you like help finding clubs or creating your own?";
  }
  
  if (lowerMessage.includes('challenge')) {
    return "Challenges are a fun way to stay motivated! You can participate in fitness challenges, compete with friends, and track your achievements. Check out the challenges section to see what's available.";
  }
  
  // Technical support
  if (lowerMessage.includes('problem') || lowerMessage.includes('error') || lowerMessage.includes('bug')) {
    return "I'm sorry you're experiencing issues! For technical problems, please contact our support team at support@scaffoldyourshape.com with details about what you're experiencing. They'll be able to help you quickly.";
  }
  
  // Account related
  if (lowerMessage.includes('account') || lowerMessage.includes('profile') || lowerMessage.includes('login')) {
    return "For account-related questions, you can manage your profile in the settings section. If you're having trouble logging in or need to update your information, I can guide you through the process. What specifically do you need help with?";
  }
  
  // Data/privacy
  if (lowerMessage.includes('data') || lowerMessage.includes('privacy') || lowerMessage.includes('delete')) {
    return "We take your privacy seriously. You can view our privacy policy to understand how we handle your data. For data deletion requests or privacy concerns, please contact our support team at support@scaffoldyourshape.com.";
  }
  
  // Pricing/subscription
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('subscription') || lowerMessage.includes('premium')) {
    return "Currently, Scaffold Your Shape offers free access to our core features! For information about premium features or future subscription plans, please check our website or contact support.";
  }
  
  // Default response
  const defaultResponses = [
    "Thank you for your message! I'm here to help with questions about Scaffold Your Shape. Could you please provide more details about what you need assistance with?",
    "I'd be happy to help! Can you tell me more specifically what you're looking for? I can assist with workouts, clubs, challenges, account settings, and more.",
    "Thanks for reaching out! For the best assistance, could you clarify what aspect of Scaffold Your Shape you need help with? I'm here to guide you through our features."
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
} 