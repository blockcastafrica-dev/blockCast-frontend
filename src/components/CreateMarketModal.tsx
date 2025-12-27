import { useState, useRef } from "react";
import { X, Plus, ArrowLeft, AlertTriangle, Calendar, Globe, Tag, Upload, Image } from "lucide-react";
import { toast } from "sonner";

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMarket?: (market: NewMarket) => void;
}

export interface NewMarket {
  claim: string;
  category: string;
  subcategory: string;
  description: string;
  source: string;
  expiresAt: Date;
  country: string;
  region: string;
  marketType: 'present' | 'future';
  imageFile: File;
  imagePreview: string;
}

const categories = [
  { id: "entertainment", name: "Entertainment", subcategories: ["Film Industry", "Music Awards", "Sports Broadcasting", "Music Charts", "Streaming", "Events"] },
  { id: "gossip", name: "Gossip", subcategories: ["Music Collaborations", "Film Casting", "Film Announcements", "Celebrity News"] },
  { id: "finance", name: "Finance", subcategories: ["Cryptocurrency", "Stock Markets", "Development Finance", "Economic Growth", "Banking"] },
  { id: "politics", name: "Politics", subcategories: ["Elections", "Continental Integration", "Energy Policy", "Constitutional Law", "Governance", "Diplomacy"] },
  { id: "sports", name: "Sports", subcategories: ["Football Tournaments", "Player Performance", "World Cup Qualifiers", "Rugby", "Athletics", "AFCON"] },
  { id: "technology", name: "Technology", subcategories: ["Satellite Internet", "Mobile Payments", "5G Networks", "Startups", "Fintech", "AI"] },
  { id: "climate", name: "Climate", subcategories: ["Reforestation", "Climate Policy", "Renewable Energy", "Environmental"] },
  { id: "health", name: "Health", subcategories: ["Disease Control", "Vaccination Programs", "Maternal Health", "Public Health", "Research"] },
  { id: "business", name: "Business", subcategories: ["Startup Funding", "Tech Ecosystem", "Mergers & Acquisitions", "IPO"] },
  { id: "brand", name: "Brand", subcategories: ["E-commerce", "Telecommunications", "Consumer Goods", "Marketing"] },
];

const regions = [
  { id: "continent", name: "Continent (All Africa)", countries: ["Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cameroon", "Cape Verde", "Central African Republic", "Chad", "Comoros", "Congo", "DRC", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "São Tomé and Príncipe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"] },
  { id: "west-africa", name: "West Africa", countries: ["Benin", "Burkina Faso", "Cape Verde", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Liberia", "Mali", "Mauritania", "Niger", "Nigeria", "Senegal", "Sierra Leone", "Togo"] },
  { id: "east-africa", name: "East Africa", countries: ["Burundi", "Comoros", "Djibouti", "Eritrea", "Ethiopia", "Kenya", "Madagascar", "Mauritius", "Rwanda", "Seychelles", "Somalia", "South Sudan", "Tanzania", "Uganda"] },
  { id: "southern-africa", name: "Southern Africa", countries: ["Angola", "Botswana", "Eswatini", "Lesotho", "Malawi", "Mozambique", "Namibia", "South Africa", "Zambia", "Zimbabwe"] },
  { id: "north-africa", name: "North Africa", countries: ["Algeria", "Egypt", "Libya", "Morocco", "Sudan", "Tunisia"] },
  { id: "central-africa", name: "Central Africa", countries: ["Cameroon", "Central African Republic", "Chad", "Congo", "DRC", "Equatorial Guinea", "Gabon", "São Tomé and Príncipe"] },
];

export default function CreateMarketModal({ isOpen, onClose, onCreateMarket }: CreateMarketModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [claim, setClaim] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [marketType, setMarketType] = useState<'present' | 'future'>('future');
  const [expiryDate, setExpiryDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setClaim("");
    setDescription("");
    setSource("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedRegion("");
    setSelectedCountry("");
    setMarketType('future');
    setExpiryDate("");
    setImageFile(null);
    setImagePreview("");
    onClose();
  };

  const handleSubmit = () => {
    if (!claim || !selectedCategory || !expiryDate || !imageFile) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newMarket: NewMarket = {
      claim,
      category: categories.find(c => c.id === selectedCategory)?.name || selectedCategory,
      subcategory: selectedSubcategory,
      description,
      source,
      expiresAt: new Date(expiryDate),
      country: selectedCountry,
      region: regions.find(r => r.id === selectedRegion)?.name || selectedRegion,
      marketType,
      imageFile,
      imagePreview,
    };

    onCreateMarket?.(newMarket);
    toast.success("Market created successfully!");
    resetAndClose();
  };

  const isStep1Valid = claim.length >= 10 && description.length >= 10 && source.length >= 3;
  const isStep2Valid = selectedCategory && selectedSubcategory;
  const isStep3Valid = expiryDate && selectedRegion && selectedCountry && imageFile;

  const currentCategory = categories.find(c => c.id === selectedCategory);
  const currentRegion = regions.find(r => r.id === selectedRegion);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={resetAndClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          backgroundColor: '#0f1419',
          borderRadius: '16px',
          border: '1px solid #1f2937',
          width: '95%',
          maxWidth: '480px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b border-gray-800"
          style={{ padding: '16px' }}
        >
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as 1 | 2)}
                className="p-1"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
            )}
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Create Market</h2>
              <p className="text-gray-500 text-xs">
                {step === 1 && "Define your claim"}
                {step === 2 && "Select category"}
                {step === 3 && "Set details"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="h-9 w-9 p-0 flex items-center justify-center rounded-xl border-2 border-transparent transition-all group"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#06f6ff';
              e.currentTarget.style.backgroundColor = '#1a1f26';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 px-4 pt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1 h-1 rounded-full transition-colors"
              style={{
                backgroundColor: s <= step ? '#06f6ff' : '#374151',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">

          {/* Step 1: Claim & Description */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  Market Claim <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={claim}
                  onChange={(e) => setClaim(e.target.value)}
                  placeholder="e.g., Will Nigeria win AFCON 2025?"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1f26',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
                <p className="text-gray-500 text-xs mt-1">
                  {claim.length}/200 characters (min 10)
                </p>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide context and details about this market..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1f26',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
                <p className="text-gray-500 text-xs mt-1">
                  {description.length}/500 characters (min 10)
                </p>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  Source <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g., Official government announcement, News outlet"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1f26',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                onClick={() => isStep1Valid && setStep(2)}
                disabled={!isStep1Valid}
                style={{
                  backgroundColor: isStep1Valid ? '#06f6ff' : '#334155',
                  color: isStep1Valid ? 'black' : 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  width: '100%',
                  fontWeight: 600,
                  cursor: isStep1Valid ? 'pointer' : 'not-allowed',
                }}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Category Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Category <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubcategory("");
                      }}
                      className="p-3 rounded-xl text-left transition-colors"
                      style={{
                        backgroundColor: selectedCategory === cat.id ? '#06f6ff20' : '#1a1f26',
                        border: selectedCategory === cat.id ? '1px solid #06f6ff' : '1px solid #374151',
                        color: selectedCategory === cat.id ? '#06f6ff' : 'white',
                      }}
                    >
                      <span className="text-sm font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {currentCategory && (
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Subcategory <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentCategory.subcategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubcategory(sub)}
                        className="px-3 py-2 rounded-lg text-sm transition-colors"
                        style={{
                          backgroundColor: selectedSubcategory === sub ? '#06f6ff20' : '#1a1f26',
                          border: selectedSubcategory === sub ? '1px solid #06f6ff' : '1px solid #374151',
                          color: selectedSubcategory === sub ? '#06f6ff' : '#9ca3af',
                        }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Market Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMarketType('present')}
                    className="p-3 rounded-xl text-left transition-colors"
                    style={{
                      backgroundColor: marketType === 'present' ? '#06f6ff20' : '#1a1f26',
                      border: marketType === 'present' ? '1px solid #06f6ff' : '1px solid #374151',
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: marketType === 'present' ? '#06f6ff' : 'white' }}>
                      Present
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Is this true now?</p>
                  </button>
                  <button
                    onClick={() => setMarketType('future')}
                    className="p-3 rounded-xl text-left transition-colors"
                    style={{
                      backgroundColor: marketType === 'future' ? '#06f6ff20' : '#1a1f26',
                      border: marketType === 'future' ? '1px solid #06f6ff' : '1px solid #374151',
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: marketType === 'future' ? '#06f6ff' : 'white' }}>
                      Future
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Will this happen?</p>
                  </button>
                </div>
              </div>

              <button
                onClick={() => isStep2Valid && setStep(3)}
                disabled={!isStep2Valid}
                style={{
                  backgroundColor: isStep2Valid ? '#06f6ff' : '#334155',
                  color: isStep2Valid ? 'black' : 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  width: '100%',
                  fontWeight: 600,
                  cursor: isStep2Valid ? 'pointer' : 'not-allowed',
                }}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Location & Expiry */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Expiry Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1f26',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Region <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setSelectedCountry("");
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1f26',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  <option value="">Select region</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {currentRegion && (
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1f26',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  >
                    <option value="">Select country</option>
                    {currentRegion.countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-gray-300 text-sm mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Market Image <span className="text-red-400">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '1px solid #374151',
                      }}
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '24px',
                      backgroundColor: '#1a1f26',
                      border: '2px dashed #374151',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    className="hover:border-cyan-500/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-400 text-sm">Click to upload image</span>
                    <span className="text-gray-500 text-xs">PNG, JPG up to 5MB</span>
                  </button>
                )}
              </div>

              {/* Summary */}
              <div className="p-4 bg-[#1a1f26] rounded-xl border border-gray-700 space-y-2">
                <h4 className="text-white font-medium text-sm mb-3">Market Summary</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Claim</span>
                  <span className="text-white text-right max-w-[60%] truncate">{claim}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Category</span>
                  <span className="text-white">{currentCategory?.name} / {selectedSubcategory}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white capitalize">{marketType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Location</span>
                  <span className="text-white">{selectedCountry}, {currentRegion?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Expires</span>
                  <span className="text-white">{expiryDate}</span>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-500/80 text-xs">
                  Markets are reviewed before going live. Ensure your claim is clear, verifiable, and follows community guidelines.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isStep3Valid}
                style={{
                  backgroundColor: isStep3Valid ? '#06f6ff' : '#334155',
                  color: isStep3Valid ? 'black' : 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  width: '100%',
                  fontWeight: 600,
                  cursor: isStep3Valid ? 'pointer' : 'not-allowed',
                }}
              >
                Create Market
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
