// ==== PMP Study Tracker backend ====
// Setup:
// 1. Open your "PMP Study Tracker" Google Sheet.
// 2. Extensions > Apps Script.
// 3. Delete any placeholder code, paste this whole file in.
// 4. Change SECRET below to any password-like string only you know.
// 5. Deploy > New deployment > gear icon > Web app.
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Copy the Web app URL it gives you and the SECRET into the app's
//    config.js (see SETUP_GUIDE.md).

const SECRET = "CHANGE-THIS-TO-YOUR-OWN-SECRET";

const SHEETS = {
  weekly: "Weekly Plan",
  checklist: "Domain Task Checklist",
  log: "Practice Exam Log",
};

function doGet(e) {
  try {
    if (!e || e.parameter.token !== SECRET) return jsonOut({ error: "unauthorized" });
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return jsonOut({
      weeklyPlan: readWeekly(ss),
      domainChecklist: readChecklist(ss),
      practiceExamLog: readLog(ss),
    });
  } catch (err) {
    return jsonOut({ error: String(err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.token !== SECRET) return jsonOut({ error: "unauthorized" });
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (body.type === "quiz_result") {
      appendLog(ss, body);
    } else if (body.type === "checklist_update") {
      updateChecklist(ss, body);
    } else if (body.type === "hours_log") {
      updateWeekly(ss, body);
    } else {
      return jsonOut({ error: "unknown type" });
    }
    return jsonOut({ status: "ok" });
  } catch (err) {
    return jsonOut({ error: String(err) });
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function readWeekly(ss) {
  const sh = ss.getSheetByName(SHEETS.weekly);
  const rows = sh.getRange(2, 1, 12, 10).getValues();
  return rows.map(function (r, i) {
    return {
      row: i + 2,
      week: r[0],
      dates: r[1],
      focus: r[2],
      domain: r[3],
      topics: r[4],
      materials: r[5],
      plannedHours: r[6],
      actualHours: r[7],
      status: r[8],
      notes: r[9],
    };
  });
}

function readChecklist(ss) {
  const sh = ss.getSheetByName(SHEETS.checklist);
  const rows = sh.getRange(2, 1, 26, 5).getValues();
  return rows.map(function (r, i) {
    return {
      row: i + 2,
      domain: r[0],
      task: r[1],
      confidence: r[2],
      done: r[3],
      notes: r[4],
    };
  });
}

function readLog(ss) {
  const sh = ss.getSheetByName(SHEETS.log);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const rows = sh.getRange(2, 1, last - 1, 9).getValues();
  return rows
    .filter(function (r) {
      return r[0] !== "" && r[0] !== null;
    })
    .map(function (r) {
      return {
        date: r[0],
        source: r[1],
        type: r[2],
        overallScore: r[3],
        peopleScore: r[4],
        processScore: r[5],
        bizScore: r[6],
        weakestDomain: r[7],
        notes: r[8],
      };
    });
}

function appendLog(ss, body) {
  const sh = ss.getSheetByName(SHEETS.log);
  const last = sh.getLastRow();
  var targetRow = last + 1;
  // Reuse the first blank seeded row instead of always appending past row 60.
  const data = sh.getRange(2, 1, Math.max(last - 1, 0), 1).getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === "" || data[i][0] === null) {
      targetRow = i + 2;
      break;
    }
  }
  sh.getRange(targetRow, 1, 1, 9).setValues([
    [
      body.date || new Date(),
      body.source || "PMP Study App",
      body.examType || "Domain quiz",
      body.overallScore,
      body.peopleScore || "",
      body.processScore || "",
      body.bizScore || "",
      body.weakestDomain || "",
      body.notes || "",
    ],
  ]);
}

function updateChecklist(ss, body) {
  const sh = ss.getSheetByName(SHEETS.checklist);
  if (!body.row || body.row < 2 || body.row > 27) throw new Error("bad row");
  if (body.confidence !== undefined) sh.getRange(body.row, 3).setValue(body.confidence);
  if (body.done !== undefined) sh.getRange(body.row, 4).setValue(body.done ? "Yes" : "No");
  if (body.notes !== undefined) sh.getRange(body.row, 5).setValue(body.notes);
}

function updateWeekly(ss, body) {
  const sh = ss.getSheetByName(SHEETS.weekly);
  if (!body.row || body.row < 2 || body.row > 13) throw new Error("bad row");
  if (body.actualHours !== undefined) sh.getRange(body.row, 8).setValue(body.actualHours);
  if (body.status !== undefined) sh.getRange(body.row, 9).setValue(body.status);
  if (body.notes !== undefined) sh.getRange(body.row, 10).setValue(body.notes);
}
