# Workflow-Beispiele (nicht ausführbar)

Diese Skizzen dienen ausschließlich der Veranschaulichung der Struktur.
Sie werden in Phase 7 **nicht** ausgeführt.

## 1. Wöchentlicher AI-Gesamtbericht

```
wf_weekly_review
  s_collect_cto      (cto)         → Report-Skelett füllen
  s_collect_qa       (qa)          → Befunde zusammenfassen
  s_collect_seo      (seo)         → Onpage-Snapshot
  s_collect_security (security)    → Risiken nach Schweregrad
  s_collect_finance  (finance)     → Pricing/Margen-Notiz
  s_consolidate_ceo  (ceo)         depends_on: alle s_collect_*
  s_human_review                   requires_approval: true
```

## 2. Landingpage-SEO-Check

```
wf_seo_landing_check
  s_inventory_seo    (seo)
  s_inventory_qa     (qa)          parallel
  s_recommendations_seo (seo)      depends_on: [s_inventory_seo, s_inventory_qa]
  s_review_ceo       (ceo)         requires_approval: true
```

## 3. Reaktion auf Security-Befund

```
wf_security_followup
  s_classify        (security)
  s_assess_cto      (cto)          depends_on: [s_classify]
  s_decide_ceo      (ceo)          depends_on: [s_assess_cto]
                                   requires_approval: true
  s_plan_operations (operations)   depends_on: [s_decide_ceo]
                                   requires_approval: true
```

In allen Beispielen gilt:

- `trigger: manual`
- jeder Schritt mit Außenwirkung trägt `requires_approval: true`
- `ceo` ist immer konsolidierend, niemals ausführend
