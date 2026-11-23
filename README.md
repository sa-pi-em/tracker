# Fieldnote — Study Control Room

A lightweight study dashboard for GATE EC and UPSC ESE Electronics & Telecommunication (E&T).

## Open it

Open `index.html` in a modern browser. The site has no build step or external runtime dependency.

## What it tracks

- Every listed syllabus topic has separate Level 1, Level 2 and Level 3 checkmarks.
- Progress percentages are calculated for each level across the selected exam and for each chapter.
- The dashboard counts down to ESE Prelims and GATE 2027. ESE defaults to 31 January; GATE defaults to the exam-window opening on 6 February, and the dates can be adjusted in the dashboard.
- Checkmarks, study sessions, the running timer and topic-wheel entries save in this browser on this device.
- Supabase account sync and its GitHub Pages email redirect are configured. Open the [live tracker](https://sa-pi-em.github.io/tracker/) and choose **Connect** to create an account; see [`BACKEND_SETUP.md`](BACKEND_SETUP.md).
- Use **Export backup** on the syllabus page to download a JSON backup. **Import** restores a backup in this browser.
- Study time can be recorded with the live timer or entered manually by date, exam and duration.
- The topic roulette starts with a small mixed pool; add custom topics or select topics from either syllabus.

The source PDFs are included beside the site: `EC_GATE2027_Syllabus.pdf` and `Notif-ESEP-2027-Engl-160926.pdf`.

For backend setup status and the remaining publish steps, see [`BACKEND_SETUP.md`](BACKEND_SETUP.md).
