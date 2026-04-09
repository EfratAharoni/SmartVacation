/**
 * Fuzzy / smart search for Hebrew destinations.
 * Supports: Hebrew typos, Latin transliterations, country → city mapping.
 *
 * Also exports parseHebrewVacationQuery() — a zero-dependency NLP parser
 * that extracts search params from free Hebrew text (no AI API needed).
 */

const DESTINATION_INDEX = [
  {
    name: "פריז, צרפת",
    aliases: ["paris", "france", "פאריז", "פארי", "פריז", "צרפת", "פרנס"],
  },
  {
    name: "רומא, איטליה",
    aliases: ["rome", "roma", "italy", "איטליה", "רומה", "איטלי"],
  },
  {
    name: "ברצלונה, ספרד",
    aliases: ["barcelona", "spain", "ספרד", "ברצלונה", "ספרדי"],
  },
  {
    name: "אמסטרדם, הולנד",
    aliases: ["amsterdam", "netherlands", "holland", "הולנד", "נדרלנד"],
  },
  {
    name: "לונדון, אנגליה",
    aliases: ["london", "england", "uk", "britain", "אנגליה", "בריטניה"],
  },
  {
    name: "דובאי, איחוד האמירויות",
    aliases: ["dubai", "uae", "emirates", "דובאי", "אמירויות", "איחוד"],
  },
  {
    name: "באלי, אינדונזיה",
    aliases: ["bali", "indonesia", "אינדונזיה", "באלי"],
  },
  {
    name: "טוקיו, יפן",
    aliases: ["tokyo", "japan", "יפן", "טוקיה", "יאפן"],
  },
  {
    name: 'ניו יורק, ארה"ב',
    aliases: [
      "new york",
      "nyc",
      "ny",
      "usa",
      "america",
      "ניו יורק",
      "ניויורק",
      "אמריקה",
      'ארה"ב',
      "ארהב",
    ],
  },
  {
    name: 'מיאמי, ארה"ב',
    aliases: [
      "miami",
      "florida",
      "פלורידה",
      "מיאמי",
      'ארה"ב',
      "ארהב",
      "אמריקה",
    ],
  },
  {
    name: "קנקון, מקסיקו",
    aliases: ["cancun", "mexico", "מקסיקו", "קנקון", "קנקן"],
  },
  {
    name: "סנטוריני, יוון",
    aliases: ["santorini", "greece", "יוון", "סנטוריני", "יווני", "יוונית"],
  },
  {
    name: "פראג, צ'כיה",
    aliases: ["prague", "czech", "czechia", "צ'כיה", "פראג", "צכיה", "פרג"],
  },
  {
    name: "בנגקוק, תאילנד",
    aliases: ["bangkok", "thailand", "תאילנד", "בנגקוק", "תייגון"],
  },
  {
    name: "מלדיביים",
    aliases: ["maldives", "maldive", "מלדיב", "מאלדיב"],
  },
  {
    name: "איסטנבול, טורקיה",
    aliases: [
      "istanbul",
      "turkey",
      "turkiye",
      "טורקיה",
      "טורקייה",
      "איסטנבול",
      "קושטא",
    ],
  },
  {
    name: "ברלין, גרמניה",
    aliases: ["berlin", "germany", "גרמניה", "ברלין", "גרמן"],
  },
  {
    name: "ליסבון, פורטוגל",
    aliases: ["lisbon", "portugal", "פורטוגל", "ליסבון", "ליסאבון", "פורטגל"],
  },
];

/**
 * Returns scored destination names matching the query.
 * @param {string} query
 * @param {number} limit
 * @returns {string[]}
 */
export function fuzzySearchDestinations(query, limit = 8) {
  if (!query.trim()) {
    return DESTINATION_INDEX.map((d) => d.name).slice(0, limit);
  }

  const q = query.toLowerCase().trim();

  const scored = DESTINATION_INDEX.map((dest) => {
    const nameLower = dest.name.toLowerCase();

    // Exact or partial match on display name → highest score
    const nameExact = nameLower === q ? 10 : 0;
    const nameContains = nameLower.includes(q) ? 4 : 0;

    // Alias match
    const aliasExact = dest.aliases.some((a) => a.toLowerCase() === q) ? 8 : 0;
    const aliasContains = dest.aliases.some((a) =>
      a.toLowerCase().includes(q)
    )
      ? 3
      : 0;

    // Query contains alias (e.g. user typed "יוון פריז" catches "יוון")
    const queryContainsAlias = dest.aliases.some((a) =>
      q.includes(a.toLowerCase())
    )
      ? 1
      : 0;

    const score =
      nameExact +
      nameContains +
      aliasExact +
      aliasContains +
      queryContainsAlias;

    return { name: dest.name, score };
  })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((d) => d.name);
}

/* ─────────────────────────────────────────────────────────────
   Hebrew Vacation Query Parser
   Parses free Hebrew text into structured search parameters.
   No AI API required — rule-based regex matching.

   Examples:
     "חופשה לזוג בתאילנד בסביבות יולי ב-5,000 ₪"
     → { destination: "בנגקוק, תאילנד", guests: 2, budget: 5000,
         startDate: "2026-07-01", endDate: "2026-07-08" }

     "שבוע ביוון בספטמבר"
     → { destination: "סנטוריני, יוון", guests: null, budget: null,
         startDate: "2026-09-01", endDate: "2026-09-08" }
───────────────────────────────────────────────────────────── */

const MONTH_MAP = {
  ינואר: 0, פברואר: 1, מרץ: 2, אפריל: 3, מאי: 4, יוני: 5,
  יולי: 6, אוגוסט: 7, ספטמבר: 8, אוקטובר: 9, נובמבר: 10, דצמבר: 11,
};

/**
 * Vibe → matching destination keywords (substrings of deal.destination)
 * Used by Deals.jsx to filter deals when no specific destination is chosen.
 */
export const VIBE_DESTINATIONS = {
  beach:     ["מלדיביים", "באלי", "מיאמי", "קנקון", "סנטוריני", "ברצלונה"],
  adventure: ["באלי", "בנגקוק", "דובאי", "איסטנבול", "טוקיו"],
  romantic:  ["פריז", "סנטוריני", "פראג", "ליסבון", "רומא"],
  city:      ["פריז", "לונדון", "ניו יורק", "ברלין", "אמסטרדם", "פראג", "רומא", "ברצלונה"],
};

/** Hebrew label for each vibe (used in badge + badge tooltip) */
export const VIBE_LABELS = {
  beach:     "חוף ובטן-גב",
  adventure: "אקסטרים והרפתקאות",
  cheap:     "הכי זולים",
  romantic:  "רומנטי",
  city:      "סיטי-טריפ",
  kosher:    "כשר בלבד",
};

/**
 * Parse free Hebrew text into vacation search params.
 * @param {string} text
 * @returns {{ destination: string|null, startDate: string|null, endDate: string|null,
 *             budget: number|null, guests: number|null,
 *             isKosher: boolean, vibe: string|null }}
 */
export function parseHebrewVacationQuery(text) {
  const result = {
    destination: null,
    startDate: null,
    endDate: null,
    budget: null,
    guests: null,
    isKosher: false,
    vibe: null,
  };

  if (!text.trim()) return result;

  // ── Kosher ──
  if (/כשר|כשרה|כשרות|שומר.{0,4}כשרות/.test(text)) {
    result.isKosher = true;
    result.vibe = "kosher";
  }

  // ── Vibe (only if not already set by kosher) ──
  if (!result.vibe) {
    if (/בטן.{0,3}גב|חוף|ים|שמש|טרופי|ביקיני|beach/.test(text)) {
      result.vibe = "beach";
    } else if (/אקסטרים|אדרנלין|הרפתק|ספורט קיצון|extreme|סקי|גלישה/.test(text)) {
      result.vibe = "adventure";
    } else if (/זול|זולה|תקציב|מוזל|ב.{0,3}זול|budget|cheap/.test(text)) {
      result.vibe = "cheap";
    } else if (/רומנטי|רומנטית|זוגי|רומנס|romantic/.test(text)) {
      result.vibe = "romantic";
    } else if (/סיטי|עיר|תרבות|מוזיאון|city.?trip/.test(text)) {
      result.vibe = "city";
    }
  }

  // ── Guests ──
  if (/זוג|שניים|שניינו|אני וה/.test(text)) {
    result.guests = 2;
  } else if (/לבד|סולו|יחיד|יחידה/.test(text)) {
    result.guests = 1;
  } else if (/משפחה/.test(text)) {
    result.guests = 4;
  } else {
    const m = text.match(/(\d+)\s*(נוסעים|אנשים|כאלה|אנשי)/);
    if (m) result.guests = parseInt(m[1], 10);
  }

  // ── Budget ──
  const budgetMatch = text.match(/(\d[\d,]+)\s*(₪|שקל|שקלים|ש"ח|ש״ח)/);
  if (budgetMatch) {
    result.budget = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
  }

  // ── Month → start date ──
  let duration = 7;
  for (const [name, idx] of Object.entries(MONTH_MAP)) {
    if (text.includes(name)) {
      const year = new Date().getFullYear();
      const start = new Date(year, idx, 1);
      result.startDate = start.toISOString().slice(0, 10);
      break;
    }
  }

  // ── Duration ──
  const daysMatch = text.match(/(\d+)\s*ימים/);
  const nightsMatch = text.match(/(\d+)\s*לילות/);
  if (daysMatch) duration = parseInt(daysMatch[1], 10);
  else if (nightsMatch) duration = parseInt(nightsMatch[1], 10) + 1;
  else if (/שבועיים/.test(text)) duration = 14;
  else if (/שבוע/.test(text)) duration = 7;
  else if (/סוף שבוע/.test(text)) duration = 3;

  if (result.startDate) {
    const end = new Date(result.startDate);
    end.setDate(end.getDate() + duration);
    result.endDate = end.toISOString().slice(0, 10);
  }

  // ── Destination — fuzzy search (skip if vibe covers all destinations) ──
  const suggestions = fuzzySearchDestinations(text, 1);
  if (suggestions.length > 0) {
    result.destination = suggestions[0];
  }

  return result;
}
