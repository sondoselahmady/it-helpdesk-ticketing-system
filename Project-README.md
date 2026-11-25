# IT Helpdesk Ticketing System

A Google Apps Script helpdesk web app with user onboarding and approval, ticket submission, and screenshot uploads to Google Drive. Google Sheets stores users and tickets.

## Files
- `Code.gs`: server-side user, ticket, spreadsheet, and Drive logic.
- `Index.html`: employee and administrator interface.

## Setup
Create a Google Apps Script project bound to the intended spreadsheet and add these files as `Code.gs` and `Index.html`. Confirm the spreadsheet includes the expected `Users` and `Tickets` sheets, then deploy the web app with access settings appropriate for its audience. Review the code's identity and permissions model before using real user data.
