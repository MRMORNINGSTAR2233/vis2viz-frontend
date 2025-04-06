import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const exampleCards = [
  {
    title: "Analyze phone call sentiment",
    description: "Identify customer satisfaction trends from service call recordings",
    icon: "🗣️"
  },
  {
    title: "Extract podcast insights",
    description: "Summarize key points and topics from audio content",
    icon: "🎙️"
  },
  {
    title: "Process meeting recordings",
    description: "Capture action items and decisions from team discussions",
    icon: "📝"
  },
  {
    title: "Detect voice biometrics",
    description: "Authenticate users through unique voice patterns",
    icon: "🔐"
  },
  {
    title: "Track music engagement",
    description: "Measure audience response to audio tracks in real-time",
    icon: "🎵"
  },
  {
    title: "Monitor environmental sounds",
    description: "Alert to unusual noises in security or industrial settings",
    icon: "🔊"
  }
];

export default function Hero() {
  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <motion.div 
          className="absolute -top-48 -left-48 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse-glow"
          animate={{ 
            rotate: [0, 15, 0, -15, 0],
            scale: [1, 1.05, 1, 0.95, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/4 right-0 w-80 h-80 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse-glow" 
          style={{ animationDelay: '1s' }}
          animate={{ 
            rotate: [0, -20, 0, 20, 0],
            scale: [1, 0.95, 1, 1.05, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse-glow"
          style={{ animationDelay: '2s' }}
          animate={{ 
            rotate: [0, 20, 0, -20, 0],
            scale: [1, 1.1, 1, 0.9, 1]
          }}
          transition={{ 
            duration: 18, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>
      </div>

      <div className="container px-4 mx-auto text-center">
        <div className="max-w-4xl mx-auto mb-16">
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Decode audio data.
            <br />
            Find valuable patterns.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Drive better decisions.
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-300 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Free to use. Easy to implement. Auralytics AI can help with audio analysis, pattern recognition, speech processing, and more.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link 
              to="/signup" 
              className="rounded-md px-6 py-3 bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              Start now →
            </Link>
            <Link 
              to="#demo" 
              className="rounded-md px-6 py-3 bg-dark-800/80 text-gray-300 hover:text-white transition-colors"
            >
              Download the app →
            </Link>
          </motion.div>
        </div>
        
        {/* Example cards grid similar to ChatGPT landing page */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {exampleCards.map((card, index) => (
            <motion.div 
              key={index} 
              className="glossy-card p-6 rounded-xl text-left hover:bg-dark-800/50 cursor-pointer"
              whileHover={{ 
                scale: 1.02,
                rotate: [0, 0.5],
                transition: {
                  rotate: { repeat: Infinity, repeatType: "mirror", duration: 0.5 }
                }
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start gap-3">
                <motion.span 
                  className="text-2xl"
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: index * 0.5 }}
                >
                  {card.icon}
                </motion.span>
                <div>
                  <h3 className="font-medium text-white mb-1">{card.title}</h3>
                  <p className="text-gray-400 text-sm">{card.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 