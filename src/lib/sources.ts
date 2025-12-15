export interface FeedSource {
  url: string;
  source: string;
  name: string;
}

export const feeds: FeedSource[] = [
  // Major News Sites
  {
    url: "https://spectrum.ieee.org/feeds/topic/robotics.rss",
    source: "ieee",
    name: "IEEE Spectrum Robotics",
  },
  {
    url: "https://www.therobotreport.com/feed/",
    source: "robotreport",
    name: "The Robot Report",
  },
  {
    url: "https://robohub.org/feed/",
    source: "robohub",
    name: "Robohub",
  },
  {
    url: "https://roboticsandautomationnews.com/feed/",
    source: "ranews",
    name: "Robotics & Automation News",
  },
  {
    url: "https://www.sciencedaily.com/rss/computers_math/robotics.xml",
    source: "sciencedaily",
    name: "ScienceDaily Robotics",
  },

  // Tech & Maker Sites
  {
    url: "https://hackaday.com/tag/robots/feed/",
    source: "hackaday",
    name: "Hackaday",
  },
  {
    url: "https://www.reddit.com/r/robotics/.rss",
    source: "reddit",
    name: "r/robotics",
  },
  {
    url: "https://www.reddit.com/r/ROS/.rss",
    source: "reddit-ros",
    name: "r/ROS",
  },

  // University & Research
  {
    url: "https://news.mit.edu/rss/topic/robotics",
    source: "mit",
    name: "MIT Robotics",
  },
  {
    url: "https://techxplore.com/rss-feed/robotics-news/",
    source: "techxplore",
    name: "TechXplore Robotics",
  },

  // Industry Blogs
  {
    url: "https://blog.robotiq.com/rss.xml",
    source: "robotiq",
    name: "Robotiq Blog",
  },
  {
    url: "https://www.universal-robots.com/blog/rss/",
    source: "ur",
    name: "Universal Robots",
  },

  // AI & Robotics
  {
    url: "https://aibusiness.com/rss.xml",
    source: "aibusiness",
    name: "AI Business",
  },
  {
    url: "https://venturebeat.com/category/ai/feed/",
    source: "venturebeat",
    name: "VentureBeat AI",
  },

  // Drones
  {
    url: "https://dronedj.com/feed/",
    source: "dronedj",
    name: "DroneDJ",
  },
  {
    url: "https://www.thedronegirl.com/feed/",
    source: "dronegirl",
    name: "The Drone Girl",
  },

  // Hardware & Electronics
  {
    url: "https://www.sparkfun.com/feeds/news",
    source: "sparkfun",
    name: "SparkFun",
  },
  {
    url: "https://blog.adafruit.com/category/robots-robotics/feed/",
    source: "adafruit",
    name: "Adafruit Robotics",
  },

  // Automation & Industrial
  {
    url: "https://www.automationworld.com/rss.xml",
    source: "autoworld",
    name: "Automation World",
  },
  {
    url: "https://www.themanufacturer.com/feed/",
    source: "manufacturer",
    name: "The Manufacturer",
  },

  // General Tech (robotics tagged)
  {
    url: "https://techcrunch.com/tag/robotics/feed/",
    source: "techcrunch",
    name: "TechCrunch Robotics",
  },
  {
    url: "https://arstechnica.com/tag/robots/feed/",
    source: "arstechnica",
    name: "Ars Technica Robots",
  },

  // AI News
  {
    url: "https://openai.com/blog/rss/",
    source: "openai",
    name: "OpenAI Blog",
  },
  {
    url: "https://blog.google/technology/ai/rss/",
    source: "google-ai",
    name: "Google AI Blog",
  },
  {
    url: "https://www.marktechpost.com/feed/",
    source: "marktechpost",
    name: "MarkTechPost AI",
  },
  {
    url: "https://the-decoder.com/feed/",
    source: "decoder",
    name: "The Decoder",
  },
  {
    url: "https://syncedreview.com/feed/",
    source: "synced",
    name: "Synced AI",
  },
  {
    url: "https://www.artificialintelligence-news.com/feed/",
    source: "ainews",
    name: "AI News",
  },
];

export const domains = [
  { id: "all", name: "All", icon: "◉" },
  { id: "ai", name: "AI", icon: "◎" },
  { id: "drones", name: "Drones", icon: "◈" },
  { id: "arms", name: "Arms", icon: "◇" },
  { id: "humanoids", name: "Humanoids", icon: "◆" },
  { id: "mobile", name: "Mobile", icon: "○" },
  { id: "industrial", name: "Industrial", icon: "□" },
  { id: "diy", name: "DIY", icon: "△" },
] as const;

export type DomainId = (typeof domains)[number]["id"];
