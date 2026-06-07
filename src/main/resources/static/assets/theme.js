/* PetLogs — 디자인 토큰 (Stitch "Professional Planner" 프로토타입 기준) */
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "tertiary-container": "#aa614d",
        "surface-container-high": "#e9e8e6",
        "on-background": "#1a1c1b",
        "outline-variant": "#c2c7ce",
        "on-secondary": "#ffffff",
        "error": "#ba1a1a",
        "surface-dim": "#dadad8",
        "surface-bright": "#faf9f7",
        "on-primary": "#ffffff",
        "on-error-container": "#93000a",
        "surface-tint": "#3f627e",
        "on-secondary-container": "#4a6a4f",
        "surface": "#faf9f7",
        "primary-fixed": "#cbe6ff",
        "surface-variant": "#e3e2e0",
        "on-error": "#ffffff",
        "tertiary-fixed": "#ffdbd1",
        "on-surface": "#1a1c1b",
        "inverse-primary": "#a7cbeb",
        "background": "#faf9f7",
        "outline": "#72787e",
        "on-primary-container": "#fcfcff",
        "secondary": "#45664b",
        "surface-container-low": "#f4f3f1",
        "surface-container-highest": "#e3e2e0",
        "on-tertiary": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-container": "#efeeec",
        "on-tertiary-container": "#fffbff",
        "inverse-surface": "#2f3130",
        "on-surface-variant": "#42474d",
        "tertiary": "#8d4937",
        "inverse-on-surface": "#f1f1ef",
        "primary-container": "#557895",
        "secondary-container": "#c4e9c7",
        "primary": "#3c5f7b",
        "error-container": "#ffdad6"
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
      spacing: {
        "margin": "32px", "base": "4px", "sm": "16px", "lg": "40px",
        "gutter": "24px", "xl": "64px", "xs": "8px", "md": "24px"
      },
      fontFamily: {
        "display-sm": ["Playfair Display", "serif"],
        "headline-md": ["Playfair Display", "serif"],
        "display-lg": ["Playfair Display", "serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"]
      },
      fontSize: {
        "display-sm": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-md-mobile": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "600" }]
      }
    }
  }
};
