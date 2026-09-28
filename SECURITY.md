# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | ✅ |

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Email **security@anotely.app** with:

- what the issue is and which component is affected (`app`, `src-tauri`, or `web`)
- steps to reproduce
- the impact you believe it has

You will get an acknowledgement within 72 hours and a fix or mitigation plan within 14 days.
Please give us reasonable time to ship a fix before disclosing publicly.

## How Anotely handles sensitive data

- Notes are stored in `notes.json` in the OS app-data directory. Nothing is uploaded by Anotely.
- API keys live in `settings.json` on the same machine and are only sent to the provider the user
  selected.
- Note text is transmitted to that provider solely when the user asks for proofreading or asks the
  assistant a question.
- The website (`web/`) has no analytics and no cookies.

If you find a path that sends data somewhere unexpected, that is a high-severity report.
