// Firebase ကိုချိတ်ဆက်ခြင်း (Mock & Fallback စနစ်ပါဝင်သည်)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase Setup (Real App မှာ Key တွေထည့်ရပါမည်)
const firebaseConfig = {
    apiKey: "AIzaSyCZpAAv3kv6ACBJwShfL8yxm4otGn2xcrY",
    projectId: "canolia-note",
    // အခြားလိုအပ်သော config များ...
};

let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized");
} catch(e) {
    console.warn("Firebase initialization skipped or failed. Using fallback data.", e);
}

// --- Data: Translations ---
const translations = {}; // Dynamically loaded

// --- Payment Providers Logic ---
const paymentProviders = {
    MMK: [
        { name: "KPay", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", icon: "fa-solid fa-k", account: "09977246328", qr: "img/kbz_qr.jpg" },
        { name: "AYA Pay", color: "text-red-600 bg-red-100 dark:bg-red-900/30", icon: "fa-solid fa-a", account: "09444195422", qr: "img/aya_qr.jpg" },
        { name: "CB Pay", color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30", icon: "fa-solid fa-c", account: "09723421412", qr: "img/cb_qr.jpg" },
        { name: "UAB Pay", color: "text-green-600 bg-green-100 dark:bg-green-900/30", icon: "fa-solid fa-u", account: "09977246328" },
        { name: "MAB Pay", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30", icon: "fa-solid fa-m", account: "09977246328" },
        { name: "Wave Pay", color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30", icon: "fa-solid fa-money-bill-wave", account: "09444195422", qr: "img/wave_qr.jpg" },
        { name: "A Bank", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30", icon: "fa-solid fa-building", account: "09XXXXXXXXX", qr: "img/a_bank_qr.jpg" },
        { name: "PayPal", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", icon: "fa-brands fa-paypal", account: "kyawmyothant2049@gmail.com" }
    ],
    JPY: [
        { name: "PayPay", color: "text-red-500 bg-red-100 dark:bg-red-900/30", icon: "fa-solid fa-p", account: "090-XXXX-XXXX" },
        { name: "LINE Pay", color: "text-green-500 bg-green-100 dark:bg-green-900/30", icon: "fa-brands fa-line", account: "LINE-ID-XXXX" },
        { name: "Rakuten Pay", color: "text-red-700 bg-red-100 dark:bg-red-900/30", icon: "fa-solid fa-r", account: "Rakuten-ID-XXXX" },
        { name: "PayPal", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", icon: "fa-brands fa-paypal", account: "kyawmyothant2049@gmail.com" }
    ],
    KRW: [
        { name: "KakaoPay", color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30", icon: "fa-solid fa-comment", account: "Kakao-ID-XXXX" },
        { name: "Toss", color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30", icon: "fa-solid fa-won-sign", account: "Toss-ID-XXXX" },
        { name: "Naver Pay", color: "text-green-500 bg-green-100 dark:bg-green-900/30", icon: "fa-solid fa-n", account: "Naver-ID-XXXX" },
        { name: "PayPal", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", icon: "fa-brands fa-paypal", account: "kyawmyothant2049@gmail.com" }
    ],
    THB: [
        { name: "PromptPay", color: "text-blue-800 bg-blue-100 dark:bg-blue-900/30", icon: "fa-solid fa-qrcode", account: "PromptPay-ID-XXXX" },
        { name: "TrueMoney", color: "text-orange-500 bg-orange-100 dark:bg-orange-900/30", icon: "fa-solid fa-wallet", account: "TrueMoney-ID-XXXX" },
        { name: "PayPal", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", icon: "fa-brands fa-paypal", account: "kyawmyothant2049@gmail.com" }
    ],
    USD: [
        { name: "PayPal", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", icon: "fa-brands fa-paypal", account: "kyawmyothant2049@gmail.com" },
        { name: "Stripe", color: "text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30", icon: "fa-brands fa-stripe", account: "Stripe-ID-XXXX" },
        { name: "Bank Transfer", color: "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300", icon: "fa-solid fa-building-columns", account: "Bank-Acct-XXXX" }
    ],
    CNY: [
        { name: "WeChat Pay", color: "text-green-500 bg-green-100 dark:bg-green-900/30", icon: "fa-brands fa-weixin", account: "WeChat-ID-XXXX" },
        { name: "Alipay", color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30", icon: "fa-brands fa-alipay", account: "Alipay-ID-XXXX" },
        { name: "PayPal", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", icon: "fa-brands fa-paypal", account: "kyawmyothant2049@gmail.com" }
    ]
};

// --- Data: Currencies Fallback (Realtime Fetch ကို Firebase မှခေါ်မည်) ---
// အကယ်၍ Firebase မှ မရပါက ဤ Fallback များကို သုံးမည်။
const fallbackRates = {
    USD: { rate: 1, symbol: '$' },
    MMK: { rate: 3500, symbol: 'Ks' },
    JPY: { rate: 150, symbol: '¥' },
    KRW: { rate: 1350, symbol: '₩' },
    THB: { rate: 36, symbol: '฿' },
    CNY: { rate: 7.2, symbol: '¥' }
};

let currentLang = 'en';
let currentCurrency = 'MMK';
let currencyRates = { ...fallbackRates }; // Default to fallback

$(document).ready(function() {
    
    // Set current year in footer
    $('#year').text(new Date().getFullYear());

    // --- Check localStorage for saved settings ---
    const savedSettings = {
        lang: localStorage.getItem('canolia_lang') || 'en',
        currency: localStorage.getItem('canolia_currency') || 'MMK',
        theme: localStorage.getItem('canolia_theme') || 'light',
        font: localStorage.getItem('canolia_font') || 'sans'
    };
    const hasVisited = localStorage.getItem('canolia_visited');

    if (hasVisited) {
        // Skip dialog, apply saved settings directly
        applySettings(savedSettings.lang, savedSettings.currency, savedSettings.theme, savedSettings.font);
        // Pre-fill modal selects in case user opens it
        $('#modalLang').val(savedSettings.lang);
        $('#modalCurrency').val(savedSettings.currency);
        $('#modalTheme').val(savedSettings.theme);
        $('#modalFont').val(savedSettings.font);
        $('#welcomeModal').addClass('hidden');
        $('#mainApp').removeClass('hidden');
    } else {
        // First visit — show dialog with default language
        updateLanguage('en');
    }

    // 1. Firebase မှ ငွေကြေးနှုန်းထားများကို ဆွဲယူခြင်း
    async function fetchRatesFromFirebase() {
        if(!db) return;
        try {
            // Note: 'artifacts/appId/public/data/pricing' structure ကို လိုက်နာထားပါသည်။
            // ဤနေရာတွင် appId ကို 'default' အနေဖြင့် ထားထားပါသည်။
            const pricingRef = collection(db, 'artifacts', 'canolia-note-web', 'public', 'data', 'pricing');
            const snapshot = await getDocs(pricingRef);
            if(!snapshot.empty) {
                let newRates = {};
                snapshot.forEach(doc => {
                    newRates[doc.id] = doc.data();
                });
                currencyRates = newRates;
            }
        } catch(e) {
            console.log("Using fallback rates due to DB error or no data");
        }
    }
    fetchRatesFromFirebase();

    // 2. Initial Modal UI Handling
    let isCaptchaVerified = false;
    let isPaymentCaptchaVerified = false;
    
    $('#seeMoreBtn').click(function() {
        $('#optionalSettings').slideToggle();
        $('#seeMoreIcon').toggleClass('rotate-180');
    });

    // Mock Captcha Click
    $('#mockCaptchaBox').click(function() {
        if(!isCaptchaVerified) {
            $('#captchaCheck').html('<div class="loader"></div>');
            setTimeout(() => {
                $('#captchaCheck').html('<i class="fa-solid fa-check"></i>').removeClass('border-gray-400 bg-white').addClass('border-green-500 bg-green-50 text-green-500');
                isCaptchaVerified = true;
                $('#enterSiteBtn').prop('disabled', false);
            }, 1000);
        }
    });

    // Immediate language update when changed in modal
    $('#modalLang').change(function() {
        updateLanguage($(this).val());
    });

    // Immediate theme update when changed in modal
    $('#modalTheme').change(function() {
        const theme = $(this).val();
        $('html').removeClass('dark theme-neo');
        if (theme === 'dark') $('html').addClass('dark');
        else if (theme === 'neo') $('html').addClass('theme-neo');
    });

    // Immediate font update when changed in modal
    $('#modalFont').change(function() {
        updateFont($(this).val());
    });

    // Submit Modal
    $('#enterSiteBtn').click(function() {
        currentLang = $('#modalLang').val();
        currentCurrency = $('#modalCurrency').val();
        let theme = $('#modalTheme').val();
        let font = $('#modalFont').val();

        applySettings(currentLang, currentCurrency, theme, font);

        // Save to localStorage
        localStorage.setItem('canolia_lang', currentLang);
        localStorage.setItem('canolia_currency', currentCurrency);
        localStorage.setItem('canolia_theme', theme);
        localStorage.setItem('canolia_font', font);
        localStorage.setItem('canolia_visited', '1');
        
        $('#welcomeModal').fadeOut(400, function() {
            $('#mainApp').removeClass('hidden').hide().fadeIn(500);
        });
        
        showMessage("Settings Applied Successfully", "success");
    });

    // 3. Settings Application Functions
    function applySettings(lang, currency, theme, font) {
        // Apply Language
        updateLanguage(lang);
        
        // Apply Currency
        updateCurrency(currency);
        
        // Apply Theme
        $('html').removeClass('dark theme-neo');
        if(theme === 'dark') {
            $('html').addClass('dark');
        } else if(theme === 'neo') {
            $('html').addClass('theme-neo');
        }
        $('#currentNavThemeDisplay').text(theme.charAt(0).toUpperCase() + theme.slice(1));
        $('#modalTheme').val(theme);

        // Highlight active mobile theme button
        $('.mobile-theme-btn').removeClass('border-primary bg-primary/10');
        $(`.mobile-theme-btn[data-theme="${theme}"]`).addClass('border-primary bg-primary/10');
        
        // Apply Font
        updateFont(font);
    }

    async function updateLanguage(lang) {
        currentLang = lang;
        
        if (!translations[lang]) {
            try {
                const res = await fetch(`json/${lang}.json`);
                translations[lang] = await res.json();
            } catch (e) {
                console.error("Failed to load language", lang, e);
            }
        }
        const texts = translations[lang] || translations['en'];
        if (!texts) return;
        
        $('[data-i18n]').each(function() {
            const key = $(this).attr('data-i18n');
            if(texts[key]) {
                $(this).html(texts[key]);
            }
        });

        // Update Nav Dropdown text
        $('#currentNavLangDisplay').text(lang.toUpperCase());
        $('#mobileLang').val(lang);
    }

    function updateCurrency(curr) {
        currentCurrency = curr;
        $('#currentCurrencyDisplay').text(curr);
        $('#currentNavCurrencyDisplay').text(curr);
        const rateData = currencyRates[curr] || fallbackRates[curr] || fallbackRates['USD'];
        const rate = rateData.rate;
        const symbol = rateData.symbol;

        $('.price-display').each(function() {
            const baseUsd = parseFloat($(this).attr('data-usd'));
            if(baseUsd === 0) {
                $(this).text('0');
            } else {
                // Formatting logic (e.g., add commas)
                let converted = Math.round(baseUsd * rate);
                $(this).text(converted.toLocaleString());
            }
        });

        $('.currency-symbol').text(symbol || curr);
        $('#mobileCurrency').val(curr);
    }

    function updateFont(font) {
        $('body').removeClass('font-sans font-serif font-mono').addClass('font-' + font);
        $('#currentNavFontDisplay').text(font.charAt(0).toUpperCase() + font.slice(1));
        $('#modalFont').val(font); // Sync with modal
        $('#mobileFont').val(font); // Sync with mobile
    }

    // 4. Navbar Listeners
    $('.lang-switch').click(function(e) {
        e.preventDefault();
        const lang = $(this).attr('data-lang');
        updateLanguage(lang);
        $('#modalLang').val(lang);
        localStorage.setItem('canolia_lang', lang);
    });

    $('.currency-switch').click(function(e) {
        e.preventDefault();
        const curr = $(this).attr('data-currency');
        updateCurrency(curr);
        $('#modalCurrency').val(curr);
        localStorage.setItem('canolia_currency', curr);
    });

    $('.font-switch').click(function(e) {
        e.preventDefault();
        const font = $(this).attr('data-font');
        updateFont(font);
        localStorage.setItem('canolia_font', font);
    });

    $('.theme-switch').click(function(e) {
        e.preventDefault();
        const theme = $(this).attr('data-theme');
        
        $('html').removeClass('dark theme-neo');
        if(theme === 'dark') {
            $('html').addClass('dark');
        } else if(theme === 'neo') {
            $('html').addClass('theme-neo');
        }
        
        $('#currentNavThemeDisplay').text(theme.charAt(0).toUpperCase() + theme.slice(1));
        $('#modalTheme').val(theme);
        localStorage.setItem('canolia_theme', theme);
    });

    // --- Mobile Drawer Logic ---
    function openMobileDrawer() {
        $('#mobileMenuBackdrop').removeClass('hidden').addClass('opacity-0');
        setTimeout(() => $('#mobileMenuBackdrop').removeClass('opacity-0').addClass('opacity-100'), 10);
        $('#mobileDrawer').removeClass('translate-x-full');
        // Switch hamburger to X
        $('#mobileMenuBtn i').removeClass('fa-bars').addClass('fa-xmark');
    }

    function closeMobileDrawer() {
        $('#mobileMenuBackdrop').removeClass('opacity-100').addClass('opacity-0');
        setTimeout(() => $('#mobileMenuBackdrop').addClass('hidden'), 300);
        $('#mobileDrawer').addClass('translate-x-full');
        // Switch X to hamburger
        $('#mobileMenuBtn i').removeClass('fa-xmark').addClass('fa-bars');
    }

    $('#mobileMenuBtn').click(function(e) {
        e.stopPropagation();
        const isOpen = !$('#mobileDrawer').hasClass('translate-x-full');
        if (isOpen) { closeMobileDrawer(); } else { openMobileDrawer(); }
    });

    $('#mobileDrawerClose').click(function() { closeMobileDrawer(); });

    $('#mobileMenuBackdrop').click(function() { closeMobileDrawer(); });

    // Close drawer when nav link is tapped
    $('#mobileDrawer .mobile-nav-link').click(function() { closeMobileDrawer(); });

    // Toggle Theme for Mobile (theme toggle button in nav)
    $('#navThemeToggleMobile').click(function() {
        $('#navThemeToggle').click(); // Reuse desktop logic
    });

    // Mobile Select Listeners
    $('#mobileLang').change(function() {
        const lang = $(this).val();
        updateLanguage(lang);
        $('#modalLang').val(lang);
        localStorage.setItem('canolia_lang', lang);
    });

    $('#mobileCurrency').change(function() {
        const curr = $(this).val();
        updateCurrency(curr);
        $('#modalCurrency').val(curr);
        localStorage.setItem('canolia_currency', curr);
    });

    $('#mobileFont').change(function() {
        const font = $(this).val();
        updateFont(font);
        localStorage.setItem('canolia_font', font);
    });

    // Mobile Theme Button Cards
    $('.mobile-theme-btn').click(function() {
        const theme = $(this).data('theme');
        $('html').removeClass('dark theme-neo');
        if(theme === 'dark') $('html').addClass('dark');
        else if(theme === 'neo') $('html').addClass('theme-neo');

        // Highlight selected button
        $('.mobile-theme-btn').removeClass('border-primary bg-primary/10');
        $(this).addClass('border-primary bg-primary/10');

        $('#currentNavThemeDisplay').text(theme.charAt(0).toUpperCase() + theme.slice(1));
        $('#modalTheme').val(theme);
        localStorage.setItem('canolia_theme', theme);
    });

    // Close menu when a submenu item is clicked
    $('.lang-switch, .currency-switch, .font-switch, .theme-switch').click(function() {
        $('#threeDotsMenu').addClass('hidden');
        $('.submenu').slideUp(0);
        $('.chevron-icon').removeClass('rotate-90');
    });

    // Three Dots Menu Toggle
    $('#threeDotsBtn').click(function(e) {
        e.stopPropagation();
        $('#threeDotsMenu').toggleClass('hidden');
    });

    // Accordion logic for Submenus
    $('.group-toggle').click(function(e) {
        e.stopPropagation(); // Keep main menu open
        const $submenu = $(this).next('.submenu');
        const $icon = $(this).find('.chevron-icon');
        
        // Close others
        $('.submenu').not($submenu).slideUp(200);
        $('.chevron-icon').not($icon).removeClass('rotate-90');
        
        // Toggle current
        $submenu.slideToggle(200);
        $icon.toggleClass('rotate-90');
    });

    // Prevent clicks inside menu from closing it
    $('#threeDotsMenu').click(function(e) {
        e.stopPropagation();
    });

    $(document).click(function() {
        $('#threeDotsMenu').addClass('hidden');
        // Reset submenus when closed
        $('.submenu').slideUp(0);
        $('.chevron-icon').removeClass('rotate-90');
    });

    $('#navThemeToggle').click(function() {
        let newTheme;
        if($('html').hasClass('theme-neo')) {
            $('html').removeClass('theme-neo').addClass('dark');
            newTheme = 'dark';
        } else if($('html').hasClass('dark')) {
            $('html').removeClass('dark');
            newTheme = 'light';
        } else {
            $('html').addClass('dark');
            newTheme = 'dark';
        }
        localStorage.setItem('canolia_theme', newTheme);
    });

    // --- 5. Payment Modal Logic ---
    
    // Open Payment Modal
    $('.choose-plan-btn').click(function(e) {
        e.preventDefault();
        const $card = $(this).closest('.card');
        const planTitle = $card.find('.plan-title').text();
        const amount = $card.find('.price-display').text();
        const currencySymbol = $card.find('.currency-symbol').text();
        const usdAmount = $card.find('.price-display').attr('data-usd');
        
        // Store original values on modal
        $('#paymentModal').attr('data-orig-amount', amount);
        $('#paymentModal').attr('data-orig-currency', currencySymbol);
        $('#paymentModal').attr('data-usd', usdAmount);
        
        // Update Modal Content
        $('#paymentPlanTitle').text(planTitle);
        $('#paymentPlanAmount').text(amount);
        $('#paymentPlanCurrency').text(currencySymbol);

        // Render Payment Methods based on current currency
        const methods = paymentProviders[currentCurrency] || paymentProviders['USD'];
        let methodsHtml = '';
        
        methods.forEach((method, index) => {
            methodsHtml += `
                <button class="payment-method-btn flex items-center gap-3 p-3 rounded-lg border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${index === 0 ? 'selected' : ''}" data-account="${method.account}" data-qr="${method.qr || ''}" data-name="${method.name}">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center ${method.color}">
                        <i class="${method.icon}"></i>
                    </div>
                    <span class="font-semibold text-gray-800 dark:text-gray-200 text-sm">${method.name}</span>
                </button>
            `;
        });
        $('#paymentMethodsContainer').html(methodsHtml);

        // Set default account and QR display for the first method
        if (methods.length > 0) {
            $('#paymentAccountDisplay').text(methods[0].account);
            if (methods[0].qr) {
                $('#paymentQrImg').attr('src', methods[0].qr);
                $('#paymentQrContainer').removeClass('hidden');
            } else {
                $('#paymentQrContainer').addClass('hidden');
            }
            
            // Check if default is PayPal
            if (methods[0].name === 'PayPal') {
                $('#paymentPlanAmount').text(usdAmount);
                $('#paymentPlanCurrency').text('$');
            }
        }

        // Bind click event to newly created payment method buttons
        $('.payment-method-btn').click(function() {
            $('.payment-method-btn').removeClass('selected');
            $(this).addClass('selected');
            
            // Show account details
            const account = $(this).data('account');
            $('#paymentAccountDisplay').text(account);

            // Show QR if available
            const qr = $(this).data('qr');
            if (qr) {
                $('#paymentQrImg').attr('src', qr);
                $('#paymentQrContainer').removeClass('hidden');
            } else {
                $('#paymentQrContainer').addClass('hidden');
            }

            // Switch amount if PayPal
            const name = $(this).data('name');
            if (name === 'PayPal') {
                const usd = $('#paymentModal').attr('data-usd');
                $('#paymentPlanAmount').text(usd);
                $('#paymentPlanCurrency').text('$');
            } else {
                const origAmount = $('#paymentModal').attr('data-orig-amount');
                const origCurrency = $('#paymentModal').attr('data-orig-currency');
                $('#paymentPlanAmount').text(origAmount);
                $('#paymentPlanCurrency').text(origCurrency);
            }
        });

        // Reset Captcha in Payment Modal
        isPaymentCaptchaVerified = false;
        $('#paymentCaptchaCheck').html('').removeClass('border-green-500 bg-green-50 text-green-500').addClass('border-gray-400 bg-white');
        $('#sendPaymentBtn').prop('disabled', true);

        // Reset to Step 1
        $('#paymentStep1').removeClass('hidden');
        $('#paymentStep2').addClass('hidden');

        // Show Modal
        $('#paymentModal').removeClass('hidden').addClass('flex');
    });

    // Payment Modal Step Switching
    $('#paymentNextBtn').click(function() {
        $('#paymentStep1').addClass('hidden');
        $('#paymentStep2').removeClass('hidden');
    });

    $('#paymentBackBtn').click(function() {
        $('#paymentStep2').addClass('hidden');
        $('#paymentStep1').removeClass('hidden');
    });

    function validatePaymentForm() {
        const isGmailFilled = $('#paymentGmail').val() && $('#paymentGmail').val().trim() !== '';
        const isScreenshotFilled = $('#screenshotInput')[0] && $('#screenshotInput')[0].files.length > 0;
        
        if (isPaymentCaptchaVerified && isGmailFilled && isScreenshotFilled) {
            $('#sendPaymentBtn').prop('disabled', false);
        } else {
            $('#sendPaymentBtn').prop('disabled', true);
        }
    }

    // Payment Captcha Click
    $('#paymentCaptchaBox').click(function() {
        if(!isPaymentCaptchaVerified) {
            $('#paymentCaptchaCheck').html('<div class="loader"></div>');
            setTimeout(() => {
                $('#paymentCaptchaCheck').html('<i class="fa-solid fa-check"></i>').removeClass('border-gray-400 bg-white').addClass('border-green-500 bg-green-50 text-green-500');
                isPaymentCaptchaVerified = true;
                validatePaymentForm();
            }, 1000);
        }
    });

    // Image Preview for Payment Screenshot
    $('#screenshotInput').change(function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#screenshotPreview').attr('src', e.target.result).removeClass('hidden');
                $('#uploadPlaceholder').addClass('hidden');
            }
            reader.readAsDataURL(file);
        }
        validatePaymentForm();
    });

    // Gmail Input Listener
    $('#paymentGmail').on('input', function() {
        validatePaymentForm();
    });

    // Send Payment Button Logic (Mock Network Request)
    $('#sendPaymentBtn').click(function() {
        // Show loading
        $('#paymentLoadingOverlay').removeClass('hidden').addClass('flex');
        
        // Simulate 2 seconds network delay
        setTimeout(() => {
            // Hide loading, show success
            $('#paymentLoadingOverlay').addClass('hidden').removeClass('flex');
            $('#paymentSuccessOverlay').removeClass('hidden').addClass('flex');
        }, 2000);
    });

    // Close Modal
    $('#closePaymentModal, #closeSuccessBtn').click(function() {
        $('#paymentModal').removeClass('flex').addClass('hidden');
        // Reset loading and success overlays for next time
        setTimeout(() => {
            $('#paymentLoadingOverlay').addClass('hidden').removeClass('flex');
            $('#paymentSuccessOverlay').addClass('hidden').removeClass('flex');
        }, 300);
    });


    // --- 6. Download Modal Logic ---
    $('.download-trigger-btn').click(function(e) {
        e.preventDefault();
        const os = $(this).data('os');
        const $modal = $('#downloadModal');
        const $title = $('#downloadModalTitle');
        const $icon = $('#downloadModalIcon');
        const $container = $('#downloadOptionsContainer');

        let optionsHtml = '';

        if (os === 'android') {
            $title.text('Download for Android');
            $icon.removeClass().addClass('fa-brands fa-android text-green-500 text-2xl');
            optionsHtml = `
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                        <i class="fa-solid fa-download text-xl"></i>
                    </div>
                    <div>
                        <div class="font-bold dark:text-white">Direct Download</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Download APK file directly</div>
                    </div>
                </a>
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <i class="fa-brands fa-google-play text-xl"></i>
                    </div>
                    <div>
                        <div class="font-bold dark:text-white">Play Store</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Download from Google Play</div>
                    </div>
                </a>
            `;
        } else if (os === 'ios') {
            $title.text('Download for iOS');
            $icon.removeClass().addClass('fa-brands fa-apple text-gray-800 dark:text-white text-2xl');
            optionsHtml = `
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-800 dark:text-white">
                        <i class="fa-solid fa-download text-xl"></i>
                    </div>
                    <div>
                        <div class="font-bold dark:text-white">Direct Download</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Download TestFlight / IPA</div>
                    </div>
                </a>
                <div class="flex items-center gap-4 p-4 rounded-xl border dark:border-gray-600 opacity-50 cursor-not-allowed">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <i class="fa-brands fa-app-store-ios text-xl"></i>
                    </div>
                    <div>
                        <div class="font-bold dark:text-white">App Store</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Coming Soon</div>
                    </div>
                </div>
            `;
        } else if (os === 'mac') {
            $title.text('Download for macOS');
            $icon.removeClass().addClass('fa-solid fa-laptop text-gray-600 dark:text-gray-300 text-2xl');
            optionsHtml = `
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-800 dark:text-white">
                        <i class="fa-solid fa-download text-xl"></i>
                    </div>
                    <div>
                        <div class="font-bold dark:text-white">DMG File</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Direct download for macOS</div>
                    </div>
                </a>
            `;
        } else if (os === 'windows') {
            $title.text('Download for Windows');
            $icon.removeClass().addClass('fa-brands fa-windows text-blue-500 text-2xl');
            optionsHtml = `
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <i class="fa-solid fa-download text-xl"></i>
                    </div>
                    <div>
                        <div class="font-bold dark:text-white">EXE File</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Standard Windows installer</div>
                    </div>
                </a>
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <i class="fa-solid fa-download text-xl"></i>
                    </div>
                    <div>
                        <div class="font-bold dark:text-white">MSI File</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Windows Installer Package</div>
                    </div>
                </a>
            `;
        } else if (os === 'linux') {
            $title.text('Download for Linux');
            $icon.removeClass().addClass('fa-brands fa-linux text-yellow-600 text-2xl');
            optionsHtml = `
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                        <i class="fa-solid fa-download text-xl"></i>
                    </div>
                    <div>
                        <div class="font-bold dark:text-white">DEB File</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">For Ubuntu/Debian</div>
                    </div>
                </a>
                <a href="#" class="flex items-center gap-4 p-4 rounded-xl border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                        <i class="fa-solid fa-download text-xl"></i>
                    </div>
                    <div>
                        <div class="font-bold dark:text-white">AppImage</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">Universal Linux package</div>
                    </div>
                </a>
            `;
        }

        $container.html(optionsHtml);
        $modal.removeClass('hidden').addClass('flex');
        setTimeout(() => {
            $modal.removeClass('opacity-0');
            $('#downloadModalContent').removeClass('scale-95').addClass('scale-100');
        }, 10);
    });

    // Close Download Modal
    $('#closeDownloadModal, #downloadModal').click(function(e) {
        if (e.target !== this && e.target.id !== 'closeDownloadModal' && $(e.target).closest('#closeDownloadModal').length === 0) return;
        
        const $modal = $('#downloadModal');
        $modal.addClass('opacity-0');
        $('#downloadModalContent').removeClass('scale-100').addClass('scale-95');
        setTimeout(() => {
            $modal.removeClass('flex').addClass('hidden');
        }, 300);
    });

    $('#downloadModalContent').click(function(e) {
        e.stopPropagation();
    });

    // 6. Utilities
    function showMessage(msg, type) {
        $('#msgContent').text(msg);
        $('#messageBox').removeClass('translate-y-20 opacity-0');
        setTimeout(() => {
            $('#messageBox').addClass('translate-y-20 opacity-0');
        }, 3000);
    }
});
