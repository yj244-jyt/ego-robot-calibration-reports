# Calibration report site

This directory is a static report catalog. Serve it from any static web server.
The report pages are self-contained HTML files, so each report can also be shared
and opened independently without a network connection.

Add or replace a generated report with:

```bash
.venv/bin/python scripts/publish_report_site.py \
  --report-json runs/.../report.json \
  --report-html runs/.../report-html/index.html \
  --task-json runs/.../task.json \
  --site-dir site
```

The command copies the standalone report into `site/reports/` and updates
`site/data/reports.json`. Device and run filters on the index page are generated
from that registry, so adding another device does not require frontend changes.
