import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <motion.div 
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-purple-500/30 to-blue-500/30 blur-3xl"
          animate={{ 
            rotate: [0, 15, 0, -15, 0],
            scale: [1, 1.05, 1, 0.95, 1]
          }}
          transition={{ 
            duration: 35, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-500/30 to-purple-500/30 blur-3xl"
          animate={{ 
            rotate: [0, -20, 0, 20, 0],
            scale: [1, 0.95, 1, 1.05, 1]
          }}
          transition={{ 
            duration: 40, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        ></motion.div>
      </div>
      
      <div className="container px-4 mx-auto">
        <div className="relative mx-auto max-w-4xl">
          <motion.div
            className="glossy-card rounded-2xl overflow-hidden p-8 md:p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            whileHover={{ 
              scale: 1.02, 
              transition: { type: "spring", stiffness: 200 }
            }}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
            <motion.div 
              className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 opacity-20 pointer-events-none"
              animate={{ 
                rotate: [0, 1, 0, -1, 0],
                scale: [1, 1.02, 1, 0.98, 1],
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            ></motion.div>
            
            <div className="text-center relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to transform your audio data with
                <motion.span 
                  className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
                  animate={{ 
                    backgroundPosition: ['0% center', '100% center', '0% center'],
                  }}
                  transition={{ 
                    duration: 10, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                  style={{ backgroundSize: '200% 100%' }}
                >
                  Auralytics AI?
                </motion.span>
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses using Auralytics to unlock powerful insights from their audio content.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/signup" 
                    className="rounded-md px-6 py-3 bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                  >
                    Try Now →
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/login" 
                    className="rounded-md px-6 py-3 bg-dark-800/80 text-gray-300 hover:bg-dark-800 hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 