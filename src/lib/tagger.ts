const domainKeywords: Record<string, string[]> = {
  ai: [
    "artificial intelligence", "machine learning", "deep learning", "neural network",
    "llm", "large language model", "gpt", "openai", "anthropic", "claude",
    "gemini", "chatgpt", "transformer", "diffusion", "stable diffusion",
    "generative ai", "gen ai", "ai model", "foundation model", "training",
    "inference", "nlp", "natural language", "computer vision", "ml ops",
    "reinforcement learning", "ai agent", "multimodal", "embedding"
  ],
  drones: [
    "drone", "quadcopter", "dji", "fpv", "uav", "aerial", "multirotor",
    "hexacopter", "octocopter", "mavic", "phantom", "skydio", "parrot",
    "flying robot", "unmanned aerial", "vtol"
  ],
  arms: [
    "robot arm", "robotic arm", "gripper", "manipulator", "pick and place",
    "cobot", "collaborative robot", "end effector", "6-axis", "7-axis",
    "delta robot", "scara", "articulated arm", "robotic hand"
  ],
  humanoids: [
    "humanoid", "bipedal", "tesla bot", "optimus", "figure 01", "figure 02",
    "boston dynamics", "atlas", "digit", "agility", "walking robot",
    "android", "anthropomorphic", "unitree"
  ],
  mobile: [
    "agv", "amr", "warehouse robot", "wheeled robot", "rover", "mobile robot",
    "autonomous vehicle", "self-driving", "navigation", "slam", "lidar",
    "mapping", "path planning", "delivery robot", "spot"
  ],
  industrial: [
    "factory", "manufacturing", "fanuc", "kuka", "abb", "yaskawa",
    "industrial robot", "assembly line", "welding robot", "palletizing",
    "cnc", "automation", "production line", "universal robots"
  ],
  diy: [
    "arduino", "raspberry pi", "diy", "hobby", "3d print", "maker",
    "homemade", "build your own", "tutorial", "project", "esp32",
    "servo", "stepper", "breadboard", "open source hardware"
  ],
};

export function detectDomain(title: string, description?: string): string {
  const text = `${title} ${description || ""}`.toLowerCase();

  let bestMatch = "general";
  let maxScore = 0;

  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    const score = keywords.filter(k => text.includes(k)).length;
    if (score > maxScore) {
      maxScore = score;
      bestMatch = domain;
    }
  }

  return bestMatch;
}
