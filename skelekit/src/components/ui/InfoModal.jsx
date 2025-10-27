import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github, Globe } from 'lucide-react';
import mainLogo from '../../assets/mainlogo.png';
import wordpressLogo from '../../assets/WordPress-logotype-wmark.png';

const InfoModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-700 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                
                <div className="flex justify-center">
                  <img src={mainLogo} alt="the Editor" className="h-12" />
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* About Section */}
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-4">About the CSS Editor</h3>
                      <p className="text-neutral-600 leading-relaxed">
                        SkelementorCSS presents a powerful visual CSS editor and component builder designed to streamline 
                        your development workflow. Built by the Skelementor team, it provides intuitive tools 
                        for creating, managing, and exporting CSS components with ease.
                      </p>
                    </div>

                    {/* Features */}
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-4">Key Features</h3>
                      <ul className="space-y-3 text-neutral-600">
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Visual color palette management
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Typography scale generation
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Spacing system tools
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Component library builder
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          CSS export and download
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* WordPress Integration */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={wordpressLogo} alt="WordPress" className="w-6 h-6" />
                        <h4 className="text-lg font-semibold text-neutral-800">WordPress Integration</h4>
                      </div>
                      <p className="text-neutral-600">
                        Plugin sync coming soon! Export your designs directly to WordPress with our upcoming 
                        Skelementor integration. Seamlessly bridge the gap between design and development.
                      </p>
                    </div>

                    {/* Links */}
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-4">Resources</h3>
                      <div className="space-y-3">
                        <a
                          href="https://skelementor.mintlify.app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors group"
                        >
                          <Globe size={20} className="text-blue-600" />
                          <span className="text-neutral-700 group-hover:text-neutral-800 font-medium">Documentation</span>
                          <ExternalLink size={16} className="text-neutral-400 ml-auto" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200">
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <div>
                    <div className="font-medium text-neutral-700">v 0.1.0 beta</div>
                    <div>Built by the Skelementor team</div>
                  </div>
                  <div className="text-right">
                    <div>© 2025 Skelementor</div>
                    <div>All rights reserved</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;
