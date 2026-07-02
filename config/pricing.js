// Single source of truth for plan pricing and labels.
//
// Consumers:
//   - routes/owner.js         → MRR / revenue calculation
//   - server.js /js/pricing-config.js route → serves this to the browser as
//     window.PRICING (loaded by preise.html, register.html, subscription.html)
//
// If you change values here, they propagate everywhere on the next request —
// no other file needs to be edited.

module.exports = {
  currency: '$',
  perMonthDefault: ' / Monat', // fallback when i18n key preise_per_month is missing
  plans: {
    BASIC:        { name: 'Basic',     amount: 29 },
    PROFESSIONAL: { name: 'Pro',       amount: 59 },
    UNLIMITED:    { name: 'Unlimited', amount: 99 },
  },
  // Legacy DB aliases that must resolve to a real plan for MRR calc.
  aliases: {
    PRO: 'PROFESSIONAL',
  },
};
