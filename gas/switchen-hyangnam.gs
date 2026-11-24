/**
 * 향남역 그로브 스위첸 - 방문예약 접수용 Apps Script
 *
 * 사용 방법
 * 1. 새 구글시트를 만들고 [확장 프로그램] > [Apps Script]를 엽니다.
 * 2. 기본 코드를 지우고 이 파일 내용을 그대로 붙여넣은 뒤 저장합니다.
 * 3. [배포] > [새 배포] > 유형: 웹 앱
 *    - 다음 사용자 인증정보로 실행: 나
 *    - 액세스 권한이 있는 사용자: 모든 사용자
 * 4. 배포 후 나오는 웹 앱 URL(https://script.google.com/macros/s/.../exec)을
 *    js/common-switchen.js 의 LOTTE_GAS_URL 에 넣습니다.
 *
 * 코드를 고친 뒤에는 [배포] > [배포 관리] > 수정 > 버전: 새 버전 으로 다시 배포해야 반영됩니다.
 */

// 접수 내용을 저장할 구글시트 ID (시트 주소 /d/ 와 /edit 사이 값)
const SPREADSHEET_ID = "1FaovPqojTVtkUYA57HRFaXCIW8QUArdx4cr9pG0lFFo";
const SHEET_NAME = "방문예약";
const HEADERS = [
  "접수일시",
  "현장명",
  "성함",
  "연락처",
  "방문 희망일",
  "방문 희망 시간",
  "접수 위치",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "유입 경로(referrer)",
  "접속 URL",
];

function getSpreadsheet_() {
  return SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#eef1f6");
  }
  return sheet;
}

// 수식으로 해석되지 않도록 =, +, -, @ 로 시작하는 값 앞에 ' 를 붙입니다.
function clean_(value, maxLength) {
  let text = String(value == null ? "" : value).trim().slice(0, maxLength || 300);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    const name = clean_(data.name, 30);
    const phone = clean_(data.phone, 20);
    if (!name || !phone) {
      return json_({ ok: false, error: "missing_fields" });
    }

    const row = [
      Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss"),
      clean_(data.siteName, 50),
      name,
      // 연락처 앞자리 0이 지워지지 않도록 텍스트로 저장
      "'" + phone,
      clean_(data.visitDate, 10),
      clean_(data.visitTime, 5),
      clean_(data.formPosition, 30),
      clean_(data.utmSource, 100),
      clean_(data.utmMedium, 100),
      clean_(data.utmCampaign, 100),
      clean_(data.utmContent, 100),
      clean_(data.utmTerm, 100),
      clean_(data.referrer, 300),
      clean_(data.landingUrl, 300),
    ];
    getSheet_().appendRow(row);
    notify_(row);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// 새 접수가 들어오면 스크립트 소유자(배포한 계정) 메일로 알림을 보냅니다.
// 다른 주소로도 받으려면 NOTIFY_EXTRA 에 쉼표로 추가하세요. 예) "a@x.com,b@y.com"
const NOTIFY_EXTRA = "";

function notify_(row) {
  try {
    const to = [Session.getEffectiveUser().getEmail(), NOTIFY_EXTRA]
      .filter(String)
      .join(",");
    if (!to) return;

    const [time, site, name, phoneRaw, visitDate, visitTime, position, utmSource, utmMedium, utmCampaign, utmContent] = row;
    const phone = String(phoneRaw).replace(/^'/, "");
    const sheetUrl = getSpreadsheet_().getUrl();

    const subject = "[" + site + "] 새로운 관심고객이 등록되었습니다 - " + name;
    const body = [
      "새로운 관심고객이 등록되었습니다.",
      "",
      "성함: " + name,
      "연락처: " + phone,
      "방문날짜: " + [visitDate, visitTime].filter(String).join(" "),
      "담당: ",
      "",
      "[광고 유입정보]",
      "유입매체: " + utmSource,
      "캠페인: " + utmCampaign,
      "광고소재: " + utmContent,
      "",
      "구글시트에서 상세 내용을 확인해 주세요.",
      sheetUrl,
    ].join("\n");

    MailApp.sendEmail(to, subject, body);
  } catch (err) {
    // 메일 발송에 실패해도 시트 저장은 그대로 유지합니다.
    console.error("notify failed: " + err);
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 처음 한 번 실행해서 시트·메일 권한을 승인하는 용도입니다.
function authorize() {
  getSheet_();
  Logger.log("메일 남은 할당량: " + MailApp.getRemainingDailyQuota());
}
