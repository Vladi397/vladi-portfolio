import React, { useState, useRef } from "react";
import { Check, Copy, ExternalLink, Github, Rocket, Mail, Loader2, AlertCircle } from "lucide-react";
import Reveal from "../ui/Reveal";
import emailjs from '@emailjs/browser';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  const email = "vladi.georgiev.14@gmail.com";
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // New state for form errors
  const [errors, setErrors] = useState({});

  const form = useRef();

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert(t('contact.copy_fail'));
    }
  };

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    const formData = new FormData(form.current);
    const name = formData.get("user_name");
    const emailValue = formData.get("user_email");
    const message = formData.get("message");
    
    const newErrors = {};

    // 1. Name Validation (Letters & Spaces only, min 2 chars)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name || name.length < 2) {
      newErrors.name = t('contact.error_name_short') || "Name must be at least 2 characters.";
    } else if (!nameRegex.test(name)) {
      newErrors.name = t('contact.error_name_invalid') || "Name can only contain letters.";
    }

    // 2. Email Validation (Simple regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue || !emailRegex.test(emailValue)) {
      newErrors.email = t('contact.error_email_invalid') || "Please enter a valid email address.";
    }

    // 3. Message Validation (Min 10 chars)
    if (!message || message.length < 10) {
      newErrors.message = t('contact.error_message_short') || "Message must be at least 10 characters.";
    }

    setErrors(newErrors);
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  const sendEmail = (e) => {
    e.preventDefault();

    // Run validation before sending
    if (!validateForm()) {
      return; // Stop if there are errors
    }

    setLoading(true);

    const SERVICE_ID = "service_cpwm64l";   
    const TEMPLATE_ID = "template_w6f41ai"; 
    const PUBLIC_KEY = "tweMi9zagYlpsXvjC"; 

    emailjs
      .sendForm(SERVICE_ID, TEMPLATE_ID, form.current, {
        publicKey: PUBLIC_KEY,
      })
      .then(
        () => {
          setLoading(false);
          alert(t('contact.success'));
          e.target.reset(); 
          setErrors({}); // Clear errors on success
        },
        (error) => {
          setLoading(false);
          console.error('FAILED...', error.text);
          alert(t('contact.fail'));
        },
      );
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 md:scroll-mt-32">
      <Reveal>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-[40px] blur opacity-25 dark:opacity-40 transition duration-1000 group-hover:opacity-60"></div>
          
          <div className="relative rounded-[32px] p-8 sm:p-12 md:p-16 flex flex-col lg:flex-row gap-12 lg:gap-20 items-start overflow-hidden
            bg-white shadow-2xl
            dark:bg-[#0B1120] dark:shadow-none"
          >
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] pointer-events-none" />

            {/* LEFT SIDE */}
            <div className="flex-1 w-full relative z-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 transition-colors text-gray-900 dark:text-white">
                {t('contact.title')}
              </h2>
              <p className="text-lg mb-8 max-w-md transition-colors text-gray-600 dark:text-slate-400">
                {t('contact.desc')}
              </p>
              
              <div className="flex items-center gap-3 font-bold mb-10 transition-colors text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                {t('contact.status')}
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={onCopy}
                  className="group flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all
                    bg-gray-50 border-gray-200 hover:border-sky-300 hover:bg-sky-50
                    dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                      <Mail size={20} />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-slate-200 break-all text-left">
                      {email}
                    </span>
                  </div>
                  {copied ? (
                    <Check size={18} className="text-emerald-500" />
                  ) : (
                    <Copy size={18} className="text-gray-400 group-hover:text-sky-500 transition-colors" />
                  )}
                </button>

                <div className="flex gap-4">
                  <a 
                    href="https://www.linkedin.com/in/vladi-georgiev-b68761295" 
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border font-bold transition-all bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-white/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    LinkedIn <ExternalLink size={18} />
                  </a>
                  <a 
                    href="https://github.com/Vladi397/vladi-portfolio" 
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border font-bold transition-all bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-white/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    GitHub <Github size={18} />
                  </a>
                </div>
              </div>
            </div>

            {/* FORM SIDE */}
            <form
              ref={form}
              onSubmit={sendEmail}
              className="flex-1 w-full relative z-10 bg-gray-50 dark:bg-white/5 p-6 sm:p-8 rounded-[24px] border border-gray-100 dark:border-white/5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">{t('contact.label_name')}</label>
                  <input
                    type="text"
                    name="user_name"
                    placeholder={t('contact.ph_name')}
                    // Error styling logic
                    className={`w-full p-4 rounded-xl outline-none font-medium transition-all text-base
                      ${errors.name ? "border-red-500 focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10" : "bg-white border-gray-200 dark:bg-[#0B1120] dark:border-white/10 focus:border-sky-500 focus:ring-sky-500/10"}
                      text-gray-900 placeholder:text-gray-300 border focus:ring-4
                      dark:text-white dark:placeholder:text-slate-600`}
                  />
                  {errors.name && <p className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle size={12} /> {errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">{t('contact.label_email')}</label>
                  <input
                    type="email"
                    name="user_email"
                    placeholder={t('contact.ph_email')}
                    className={`w-full p-4 rounded-xl outline-none font-medium transition-all text-base
                      ${errors.email ? "border-red-500 focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10" : "bg-white border-gray-200 dark:bg-[#0B1120] dark:border-white/10 focus:border-sky-500 focus:ring-sky-500/10"}
                      text-gray-900 placeholder:text-gray-300 border focus:ring-4
                      dark:text-white dark:placeholder:text-slate-600`}
                  />
                  {errors.email && <p className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">{t('contact.label_message')}</label>
                <textarea
                  name="message"
                  placeholder={t('contact.ph_message')}
                  rows="4"
                  className={`w-full p-4 rounded-xl outline-none resize-none font-medium transition-all text-base
                    ${errors.message ? "border-red-500 focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10" : "bg-white border-gray-200 dark:bg-[#0B1120] dark:border-white/10 focus:border-sky-500 focus:ring-sky-500/10"}
                    text-gray-900 placeholder:text-gray-300 border focus:ring-4
                    dark:text-white dark:placeholder:text-slate-600`}
                ></textarea>
                {errors.message && <p className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle size={12} /> {errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2
                bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>{t('contact.btn_send')} <Rocket size={20} /></>}
              </button>
            </form>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default Contact;