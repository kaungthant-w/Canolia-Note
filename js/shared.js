/**
 * shared.js — Common navbar / settings functions for all sub-pages.
 * Handles: theme, font, language (i18n), mobile drawer, three-dots menu.
 * Include AFTER jQuery on any non-index page.
 */
(function () {
    "use strict";

    // ── Translation cache ────────────────────────────────────────────────────
    window.sharedTranslations = window.sharedTranslations || {};

    // ── Read saved settings ──────────────────────────────────────────────────
    var savedLang  = localStorage.getItem('canolia_lang')  || 'en';
    var savedTheme = localStorage.getItem('canolia_theme') || 'light';
    var savedFont  = localStorage.getItem('canolia_font')  || 'sans';

    // ── Apply theme to <html> ────────────────────────────────────────────────
    function applyTheme(theme) {
        $('html').removeClass('dark theme-neo');
        if (theme === 'dark')      $('html').addClass('dark');
        else if (theme === 'neo') $('html').addClass('theme-neo');

        $('#currentNavThemeDisplay').text(
            theme.charAt(0).toUpperCase() + theme.slice(1)
        );
        $('.mobile-theme-btn').removeClass('border-primary bg-primary/10');
        $('.mobile-theme-btn[data-theme="' + theme + '"]')
            .addClass('border-primary bg-primary/10');
    }

    // ── Cycle through light → dark → light ──────────────────────────────────
    function toggleTheme() {
        var newTheme;
        if      ($('html').hasClass('theme-neo')) newTheme = 'dark';
        else if ($('html').hasClass('dark'))      newTheme = 'light';
        else                                       newTheme = 'dark';
        applyTheme(newTheme);
        localStorage.setItem('canolia_theme', newTheme);
    }

    // ── Apply font class to <body> ───────────────────────────────────────────
    function applyFont(font) {
        $('body').removeClass('font-sans font-serif font-mono')
                 .addClass('font-' + font);
        $('#currentNavFontDisplay').text(
            font.charAt(0).toUpperCase() + font.slice(1)
        );
        $('#mobileFont').val(font);
    }

    // ── Load & apply language ────────────────────────────────────────────────
    async function applyLanguage(lang) {
        if (!window.sharedTranslations[lang]) {
            try {
                var res = await fetch('json/' + lang + '.json');
                window.sharedTranslations[lang] = await res.json();
            } catch (e) {
                console.error('Failed to load language:', lang, e);
            }
        }

        var texts = window.sharedTranslations[lang]
                 || window.sharedTranslations['en'];
        if (!texts) return;

        $('[data-i18n]').each(function () {
            var key = $(this).attr('data-i18n');
            if (texts[key]) $(this).html(texts[key]);
        });

        $('#currentNavLangDisplay').text(lang.toUpperCase());
        $('#mobileLang').val(lang);

        // Notify the page so it can re-render dynamic content
        $(document).trigger('shared:langChanged', [lang, texts]);
    }

    // ── Mobile drawer ────────────────────────────────────────────────────────
    function openMobileDrawer() {
        $('#mobileMenuBackdrop')
            .removeClass('hidden').addClass('opacity-0');
        setTimeout(function () {
            $('#mobileMenuBackdrop')
                .removeClass('opacity-0').addClass('opacity-100');
        }, 10);
        $('#mobileDrawer').removeClass('translate-x-full');
        $('#mobileMenuBtn i').removeClass('fa-bars').addClass('fa-xmark');
    }

    function closeMobileDrawer() {
        $('#mobileMenuBackdrop')
            .removeClass('opacity-100').addClass('opacity-0');
        setTimeout(function () {
            $('#mobileMenuBackdrop').addClass('hidden');
        }, 300);
        $('#mobileDrawer').addClass('translate-x-full');
        $('#mobileMenuBtn i').removeClass('fa-xmark').addClass('fa-bars');
    }

    // ── Wire up all shared listeners ─────────────────────────────────────────
    $(document).ready(function () {

        // Set footer year
        $('#year').text(new Date().getFullYear());

        // Apply initial settings on page load
        applyTheme(savedTheme);
        applyFont(savedFont);
        applyLanguage(savedLang);

        // ── Theme buttons ────────────────────────────────────────────────────
        $('#navThemeToggle, #navThemeToggleMobile').on('click', function () {
            toggleTheme();
        });

        $('.mobile-theme-btn').on('click', function () {
            var theme = $(this).data('theme');
            applyTheme(theme);
            localStorage.setItem('canolia_theme', theme);
        });

        // Desktop three-dots theme-switch links
        $('.theme-switch').on('click', function (e) {
            e.preventDefault();
            var theme = $(this).attr('data-theme');
            applyTheme(theme);
            localStorage.setItem('canolia_theme', theme);
            $('#threeDotsMenu').addClass('hidden');
            $('.submenu').slideUp(0);
            $('.chevron-icon').removeClass('rotate-90');
        });

        // ── Language ─────────────────────────────────────────────────────────
        $('.lang-switch').on('click', function (e) {
            e.preventDefault();
            var lang = $(this).attr('data-lang');
            applyLanguage(lang);
            localStorage.setItem('canolia_lang', lang);
            $('#threeDotsMenu').addClass('hidden');
            $('.submenu').slideUp(0);
            $('.chevron-icon').removeClass('rotate-90');
        });

        $('#mobileLang').on('change', function () {
            var lang = $(this).val();
            applyLanguage(lang);
            localStorage.setItem('canolia_lang', lang);
        });

        // ── Font ─────────────────────────────────────────────────────────────
        $('.font-switch').on('click', function (e) {
            e.preventDefault();
            var font = $(this).attr('data-font');
            applyFont(font);
            localStorage.setItem('canolia_font', font);
            $('#threeDotsMenu').addClass('hidden');
            $('.submenu').slideUp(0);
            $('.chevron-icon').removeClass('rotate-90');
        });

        $('#mobileFont').on('change', function () {
            var font = $(this).val();
            applyFont(font);
            localStorage.setItem('canolia_font', font);
        });

        // ── Three-dots menu toggle ────────────────────────────────────────────
        $('#threeDotsBtn').on('click', function (e) {
            e.stopPropagation();
            $('#threeDotsMenu').toggleClass('hidden');
        });

        $('.group-toggle').on('click', function (e) {
            e.stopPropagation();
            var $submenu = $(this).next('.submenu');
            var $icon    = $(this).find('.chevron-icon');

            $('.submenu').not($submenu).slideUp(200);
            $('.chevron-icon').not($icon).removeClass('rotate-90');

            $submenu.slideToggle(200);
            $icon.toggleClass('rotate-90');
        });

        // Prevent clicks inside menu from bubbling to document
        $('#threeDotsMenu').on('click', function (e) {
            e.stopPropagation();
        });

        // Close menu on outside click
        $(document).on('click', function () {
            $('#threeDotsMenu').addClass('hidden');
            $('.submenu').slideUp(0);
            $('.chevron-icon').removeClass('rotate-90');
        });

        // ── Mobile drawer ─────────────────────────────────────────────────────
        $('#mobileMenuBtn').on('click', function (e) {
            e.stopPropagation();
            var isOpen = !$('#mobileDrawer').hasClass('translate-x-full');
            if (isOpen) { closeMobileDrawer(); } else { openMobileDrawer(); }
        });

        $('#mobileDrawerClose, #mobileMenuBackdrop').on('click', function () {
            closeMobileDrawer();
        });

        $('#mobileDrawer .mobile-nav-link').on('click', function () {
            closeMobileDrawer();
        });
    });

    // Expose helpers globally so page-specific scripts can reuse them
    window.sharedNav = {
        applyTheme:    applyTheme,
        toggleTheme:   toggleTheme,
        applyFont:     applyFont,
        applyLanguage: applyLanguage
    };
}());
