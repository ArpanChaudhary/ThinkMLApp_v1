// Intent detection keywords for natural language understanding
const INTENT_KEYWORDS = {
  learn: ['learn', 'study', 'tutorial', 'course', 'education', 'training', 'understand'],
  quiz: ['quiz', 'test', 'exam', 'assessment', 'practice', 'question', 'challenge'],
  project: ['project', 'build', 'create', 'develop', 'implement', 'work on', 'assignment'],
  review: ['review', 'recap', 'revisit', 'go over', 'summary', 'revision', 'recall']
};

// Navigation routes for each intent
const INTENT_ROUTES = {
  learn: '/learn',
  quiz: '/quiz',
  project: '/projects',
  review: '/review'
};

// Stage-specific responses and actions
const STAGE_RESPONSES = {
  welcome: {
    botMessages: [
      "Hi! I'm ThinkBot. Welcome to ThinkMLApp.",
      "Are you a new user or already registered?"
    ],
    options: ["Register", "Login"],
    nextStage: 'welcome'
  },

  register_name: {
    botMessages: ["What is your name?"],
    nextStage: 'register_name'
  },

  register_email: {
    botMessages: ["What is your email?"],
    nextStage: 'register_email'
  },

  register_password: {
    botMessages: ["Set a password (minimum 6 characters)"],
    nextStage: 'register_password'
  },

  login_email: {
    botMessages: ["Enter your email"],
    nextStage: 'login_email'
  },

  login_password: {
    botMessages: ["Enter your password"],
    nextStage: 'login_password'
  },

  main_menu: {
    botMessages: ["What would you like to do today?"],
    options: ["Learn", "Quiz", "Project", "Review"],
    nextStage: 'main_menu'
  }
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email && emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - Whether password is valid
 */
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Detects user intent from input text
 * @param {string} input - User's input text
 * @returns {string|null} - Detected intent or null
 */
const detectIntent = (input) => {
  const normalizedInput = input.toLowerCase();
  
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some(keyword => normalizedInput.includes(keyword))) {
      return intent;
    }
  }
  
  return null;
};

/**
 * Generates personalized welcome message based on user context
 * @param {Object} context - User context object
 * @returns {string} - Personalized welcome message
 */
const generateWelcomeMessage = (context) => {
  const { userName, progressData } = context;
  let message = `Welcome${userName ? `, ${userName}` : ''}!`;

  if (progressData) {
    if (progressData.lastModule) {
      message += ` You last completed the ${progressData.lastModule}`;
      if (progressData.lastScore) {
        message += ` with ${progressData.lastScore}%`;
      }
      message += '.';
    }
    if (progressData.streak) {
      message += ` You're on a ${progressData.streak}-day learning streak!`;
    }
    if (progressData.incompleteProject) {
      message += ` Ready to continue your project on ${progressData.incompleteProject}?`;
    }
  }

  message += " What would you like to do today?";
  return message;
};

/**
 * Generates personalized suggestions based on user progress
 * @param {Object} progressData - User's progress data
 * @returns {string[]} - Array of suggested actions
 */
const generateSuggestions = (progressData) => {
  const suggestions = ["Learn", "Quiz", "Project", "Review"];
  
  if (progressData) {
    if (progressData.incompleteProject) {
      suggestions.unshift("Continue Project");
    }
    if (progressData.lastModule && !progressData.lastModuleCompleted) {
      suggestions.unshift("Continue Learning");
    }
  }
  
  return suggestions;
};

/**
 * Main function to get bot response based on user input and context
 * @param {string} input - User's input text or button click
 * @param {Object} context - Current context object
 * @returns {Object} - Response object with messages and actions
 */
const getBotResponse = (input, context) => {
  const { currentStage, userName, email, password, progressData } = context;

  // Handle registration flow
  if (currentStage === 'register_name') {
    if (input && input.trim().length > 0) {
      return {
        botMessages: ["What is your email?"],
        nextStage: 'register_email'
      };
    }
    return STAGE_RESPONSES.register_name;
  }

  if (currentStage === 'register_email') {
    if (isValidEmail(input)) {
      return {
        botMessages: ["Set a password (minimum 6 characters)"],
        nextStage: 'register_password'
      };
    }
    return {
      botMessages: ["Please enter a valid email address."],
      nextStage: 'register_email'
    };
  }

  if (currentStage === 'register_password') {
    if (isValidPassword(input)) {
      return {
        botMessages: [generateWelcomeMessage({ userName: input, progressData })],
        options: generateSuggestions(progressData),
        nextStage: 'main_menu'
      };
    }
    return {
      botMessages: ["Password must be at least 6 characters long."],
      nextStage: 'register_password'
    };
  }

  // Handle login flow
  if (currentStage === 'login_email') {
    if (isValidEmail(input)) {
      return {
        botMessages: ["Enter your password"],
        nextStage: 'login_password'
      };
    }
    return {
      botMessages: ["Please enter a valid email address."],
      nextStage: 'login_email'
    };
  }

  if (currentStage === 'login_password') {
    if (input && input.length > 0) {
      return {
        botMessages: [generateWelcomeMessage({ userName, progressData })],
        options: generateSuggestions(progressData),
        nextStage: 'main_menu'
      };
    }
    return {
      botMessages: ["Please enter your password."],
      nextStage: 'login_password'
    };
  }

  // Handle main menu and navigation
  if (currentStage === 'main_menu') {
    const intent = detectIntent(input);
    
    if (intent && INTENT_ROUTES[intent]) {
      return {
        botMessages: [`Taking you to the ${intent} section...`],
        action: 'navigate',
        route: INTENT_ROUTES[intent],
        nextStage: 'main_menu'
      };
    }

    return {
      botMessages: ["I'm not sure what you'd like to do. Please select an option:"],
      options: generateSuggestions(progressData),
      nextStage: 'main_menu'
    };
  }

  // Handle welcome stage
  if (currentStage === 'welcome') {
    if (input === 'Register') {
      return STAGE_RESPONSES.register_name;
    }
    if (input === 'Login') {
      return STAGE_RESPONSES.login_email;
    }
    return STAGE_RESPONSES.welcome;
  }

  // Default response for unknown stages
  return {
    botMessages: ["I'm not sure what to do next. Let's start over."],
    options: ["Register", "Login"],
    nextStage: 'welcome'
  };
};

export default getBotResponse; 