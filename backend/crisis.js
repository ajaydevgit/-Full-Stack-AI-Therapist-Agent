// Crisis detection patterns - keywords and phrases indicating potential crisis
const CRISIS_PATTERNS = [
  // Self-harm
  /\b(self.?harm|self.?hurt|cut(ting)? my?self|hurt(ing)? my?self)\b/i,
  /\b(burn(ing)? my?self|hit(ting)? my?self|injur(e|ing) my?self)\b/i,
  
  // Suicidal ideation
  /\b(suicide|suicidal|want to die|want to end (my|this) life)\b/i,
  /\b(kill(ing)? my?self|end(ing)? my life|take my (own )?life)\b/i,
  /\b(no reason to live|don'?t want to live|can'?t go on)\b/i,
  /\b(better off dead|better off without me|wish I was dead)\b/i,
  /\b(planning to (kill|hurt|end)|going to (kill|hurt|end) my?self)\b/i,
  
  // Harm to others
  /\b(kill (someone|them|him|her|you))\b/i,
  /\b(hurt(ing)? (someone|them|him|her)|harm(ing)? others)\b/i,
  /\b(want to (hurt|kill|attack) (someone|people))\b/i,
  
  // Crisis states
  /\b(can'?t take it anymore|reached my (breaking|limit))\b/i,
  /\b(overdose|pills? to die|methods? to (die|kill))\b/i,
  /\b(goodbye (forever|everyone|world)|final (goodbye|message))\b/i,
];

const EMERGENCY_RESOURCES = [
  {
    name: 'iCall (India)',
    number: '9152987821',
    description: 'Free counselling helpline by TISS',
    available: 'Mon-Sat, 8AM-10PM',
    country: '🇮🇳'
  },
  {
    name: 'Vandrevala Foundation',
    number: '1860-2662-345',
    description: '24/7 mental health helpline',
    available: '24/7',
    country: '🇮🇳'
  },
  {
    name: 'SNEHI Helpline',
    number: '044-24640050',
    description: 'Emotional support & crisis intervention',
    available: '24/7',
    country: '🇮🇳'
  },
  {
    name: 'International Crisis Line',
    number: '+1-800-273-8255',
    description: 'National Suicide Prevention Lifeline',
    available: '24/7',
    country: '🌍'
  },
  {
    name: 'Crisis Text Line',
    number: 'Text HOME to 741741',
    description: 'Free text-based crisis counseling',
    available: '24/7',
    country: '🌍'
  }
];

const detectCrisis = (text) => {
  if (!text) return false;
  return CRISIS_PATTERNS.some(pattern => pattern.test(text));
};

module.exports = { detectCrisis, EMERGENCY_RESOURCES };
