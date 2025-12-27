import { useState } from 'react';
import { Mail, MessageCircle, MapPin, Clock, Send, Shield, ChevronDown } from 'lucide-react';
import { BsTwitterX } from 'react-icons/bs';
import { FaDiscord, FaTelegramPlane } from 'react-icons/fa';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setFormData({ name: '', email: '', subject: '', message: '', type: 'general' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#1a1f26',
    border: '2px solid rgba(63, 63, 70, 0.5)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
  };

  const inputFocusStyle = (value: string) => ({
    ...inputStyle,
    borderColor: value ? '#06b6d4' : 'rgba(63, 63, 70, 0.5)',
  });

  return (
    <div style={{ backgroundColor: '#0f1419', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
            marginBottom: '20px'
          }}>
            <Mail style={{ width: '32px', height: '32px', color: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px'
          }}>
            Contact Us
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#9ca3af',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            Get in touch with our team for support, partnerships, or questions about truth verification
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px'
        }}>

          {/* Contact Form */}
          <div style={{
            backgroundColor: '#0f1419',
            border: '1px solid #1f2937',
            borderRadius: '16px',
            padding: '24px',
            gridColumn: 'span 1'
          }}
          className="lg:col-span-2"
          >
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)'
                }}>
                  <Send style={{ width: '16px', height: '16px', color: 'white' }} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                  Send us a Message
                </h2>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Name & Email Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#d1d5db', marginBottom: '8px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your full name"
                    required
                    style={inputFocusStyle(formData.name)}
                    onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                    onBlur={(e) => e.target.style.borderColor = formData.name ? '#06b6d4' : 'rgba(63, 63, 70, 0.5)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', color: '#d1d5db', marginBottom: '8px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    style={inputFocusStyle(formData.email)}
                    onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                    onBlur={(e) => e.target.style.borderColor = formData.email ? '#06b6d4' : 'rgba(63, 63, 70, 0.5)'}
                  />
                </div>
              </div>

              {/* Inquiry Type */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#d1d5db', marginBottom: '8px' }}>
                  Inquiry Type
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    style={{
                      ...inputStyle,
                      appearance: 'none',
                      cursor: 'pointer',
                      paddingRight: '40px'
                    }}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="media">Media & Press</option>
                    <option value="verification">Truth Verification</option>
                    <option value="community">Community Support</option>
                  </select>
                  <ChevronDown style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: '#6b7280',
                    pointerEvents: 'none'
                  }} />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#d1d5db', marginBottom: '8px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Brief description of your inquiry"
                  required
                  style={inputFocusStyle(formData.subject)}
                  onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                  onBlur={(e) => e.target.style.borderColor = formData.subject ? '#06b6d4' : 'rgba(63, 63, 70, 0.5)'}
                />
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', color: '#d1d5db', marginBottom: '8px' }}>
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  required
                  style={{
                    ...inputFocusStyle(formData.message),
                    resize: 'vertical',
                    minHeight: '120px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                  onBlur={(e) => e.target.style.borderColor = formData.message ? '#06b6d4' : 'rgba(63, 63, 70, 0.5)'}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#06b6d4',
                  color: 'black',
                  fontWeight: '600',
                  fontSize: '16px',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#22d3ee'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#06b6d4'}
              >
                <Send style={{ width: '18px', height: '18px' }} />
                Send Message
              </button>
            </form>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Contact Information */}
            <div style={{
              backgroundColor: '#0f1419',
              border: '1px solid #1f2937',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)'
                }}>
                  <MapPin style={{ width: '16px', height: '16px', color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                  Contact Information
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Mail style={{ width: '20px', height: '20px', color: '#06b6d4', marginTop: '2px' }} />
                  <div>
                    <p style={{ fontWeight: '500', color: 'white', marginBottom: '4px' }}>Email</p>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>hello@blockcast.africa</p>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>support@blockcast.africa</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <MessageCircle style={{ width: '20px', height: '20px', color: '#8b5cf6', marginTop: '2px' }} />
                  <div>
                    <p style={{ fontWeight: '500', color: 'white', marginBottom: '4px' }}>Community</p>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>Discord: blockcast-africa</p>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>Telegram: @blockcast_truth</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Clock style={{ width: '20px', height: '20px', color: '#22c55e', marginTop: '2px' }} />
                  <div>
                    <p style={{ fontWeight: '500', color: 'white', marginBottom: '4px' }}>Response Time</p>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>24 hours average</p>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>Mon-Fri: 9AM-6PM WAT</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <MapPin style={{ width: '20px', height: '20px', color: '#eab308', marginTop: '2px' }} />
                  <div>
                    <p style={{ fontWeight: '500', color: 'white', marginBottom: '4px' }}>Headquarters</p>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>Lagos, Nigeria</p>
                    <p style={{ fontSize: '14px', color: '#9ca3af' }}>Serving all of Africa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow Us */}
            <div style={{
              backgroundColor: '#0f1419',
              border: '1px solid #1f2937',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                Follow Us
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { icon: BsTwitterX, url: 'https://x.com/BlockCastLive' },
                  { icon: FaDiscord, url: '#' },
                  { icon: FaTelegramPlane, url: '#' }
                ].map((social, index) => (
                  <button
                    key={index}
                    onClick={() => window.open(social.url, '_blank')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      backgroundColor: '#1a1f26',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#06b6d4';
                      e.currentTarget.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#374151';
                      e.currentTarget.style.backgroundColor = '#1a1f26';
                    }}
                  >
                    <social.icon style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div style={{
              backgroundColor: '#1a1f26',
              border: '1px solid #1f2937',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Shield style={{ width: '20px', height: '20px', color: '#06b6d4', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.5' }}>
                  Your information is secure. We never share your data with third parties without your consent.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Alert Section */}
        <div style={{
          marginTop: '48px',
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(239, 68, 68, 0.1))',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
            Urgent Misinformation Alert?
          </h3>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px' }}>
            If you've identified dangerous misinformation that requires immediate attention, contact our emergency response team.
          </p>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#f97316',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f97316'}
          >
            <Shield style={{ width: '18px', height: '18px' }} />
            Report Emergency
          </button>
        </div>

      </div>
    </div>
  );
}
