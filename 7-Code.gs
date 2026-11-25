const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const FOLDER_NAME = "IT_Ticket_Screenshots";

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('IT Helpdesk Ticketing System')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Check or request user access
function getSessionUser() {
  const email = Session.getActiveUser().getEmail();
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Users");
  const data = sheet.getDataRange().getValues();

  let user = null;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === email.toLowerCase()) {
      user = {
        email: data[i][0],
        name: data[i][1],
        department: data[i][2],
        phone: data[i][3],
        role: data[i][4],
        status: data[i][5]
      };
      break;
    }
  }

  // Auto-register new users as "Pending"
  if (!user) {
    sheet.appendRow([email, "Pending Setup", "Pending Setup", "Pending Setup", "Employee", "Pending"]);
    user = { email: email, role: "Employee", status: "Pending" };
  }

  return user;
}

// Fetch pending users for Admin view
function getPendingUsers() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Users");
  const data = sheet.getDataRange().getValues();
  const pending = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][5] === "Pending") {
      pending.push({ row: i + 1, email: data[i][0] });
    }
  }
  return pending;
}

// Update user approval
function approveUser(email, role, name, department, phone) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Users");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === email.toLowerCase()) {
      sheet.getRange(i + 1, 2, 1, 5).setValues([[name, department, phone, role, "Approved"]]);
      return true;
    }
  }
  return false;
}

// Submit ticket
function submitTicket(ticketData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ticketSheet = ss.getSheetByName("Tickets");
    const ticketId = "TCK-" + Utilities.formatDate(new Date(), "GMT", "yyyyMMdd-HHmmss");
    let fileUrl = "None";

    if (ticketData.fileData && ticketData.fileName) {
      let folders = DriveApp.getFoldersByName(FOLDER_NAME);
      let folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);
      const decoded = Utilities.base64Decode(ticketData.fileData.split(',')[1]);
      const blob = Utilities.newBlob(decoded, ticketData.fileType, ticketData.fileName);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl();
    }

    ticketSheet.appendRow([
      ticketId,
      new Date(),
      ticketData.email,
      ticketData.name,
      ticketData.department,
      ticketData.phone,
      ticketData.ipAddress,
      ticketData.problemType,
      ticketData.problemType === "USB Port Access request" ? "N/A (USB Request)" : ticketData.details,
      fileUrl,
      ticketData.callRequested ? "Yes" : "No",
      "Open"
    ]);

    return { success: true, ticketId: ticketId };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}