/* =========================================================
   GeM COMPLIANCE AI — FINAL APP.JS
   Upload + Extraction + Analysis + Bidder Filter + Audit Trail
   Current FastAPI Backend
========================================================= */

const API_BASE = "http://127.0.0.1:8000";

const state = {
  tender: null,
  bidder: [],
  extracted: {},
  requirements: null,
  result: null,
  officerDecisions: {}
};

let selectedBidderIndex = "all";

const $ = (selector) => document.querySelector(selector);


/* =========================================================
   HELPERS
========================================================= */

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[ch])
  );
}


/* =========================================================
   REQUIREMENT DISPLAY NAMES
========================================================= */

function getRequirementDisplayName(name) {

  const labels = {
    "OEM Authorization":
      "Original Equipment Manufacturer (OEM) Authorization",

    "EPFO Compliance":
      "Employees' Provident Fund Organisation (EPFO) Compliance",

    "ESIC Compliance":
      "Employees' State Insurance Corporation (ESIC) Compliance",

    "NSIC Registration":
      "National Small Industries Corporation (NSIC) Registration"
  };

  return labels[name] || name;
}


/* =========================================================
   TOAST
========================================================= */

function toast(message) {

  const el = $("#toast");

  if (!el) return;

  el.textContent = message;
  el.classList.add("show");

  setTimeout(() => {
    el.classList.remove("show");
  }, 2600);
}


/* =========================================================
   BUSY STATE
========================================================= */

function setBusy(busy, message) {

  const btn = $("#analyzeBtn");
  const dot = $("#loaderDot");
  const msg = $("#actionMessage");

  if (btn) {
    btn.disabled = busy;
  }

  if (dot) {
    dot.classList.toggle("busy", busy);
  }

  if (msg) {
    msg.textContent = message || "";
  }
}


/* =========================================================
   API — UPLOAD
========================================================= */

async function apiUpload(file, type) {

  if (!file) {
    throw new Error("No file selected");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("document_type", type);

  const response = await fetch(
    `${API_BASE}/api/documents/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!response.ok) {

    let message =
      `Upload failed: ${response.status}`;

    try {

      const data = await response.json();

      if (Array.isArray(data.detail)) {

        message = data.detail
          .map(
            item =>
              item.msg ||
              JSON.stringify(item)
          )
          .join(", ");

      } else if (data.detail) {

        message =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);
      }

    } catch (_) {}

    throw new Error(message);
  }

  return await response.json();
}


/* =========================================================
   API — ANALYZE
   POST /api/analysis/run
========================================================= */

async function apiAnalyze(
  extracted,
  requirements
) {

  const requestBody = {
    extracted: extracted || {},

    requirements:
      Array.isArray(requirements)
        ? requirements
        : []
  };

  console.log(
    "Sending analysis request:",
    requestBody
  );

  const response = await fetch(
    `${API_BASE}/api/analysis/run`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },

      body: JSON.stringify(requestBody)
    }
  );

  if (!response.ok) {

    let message =
      `Analysis failed: ${response.status}`;

    try {

      const data =
        await response.json();

      if (data.detail) {

        message =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);
      }

    } catch (_) {}

    throw new Error(message);
  }

  return await response.json();
}


/* =========================================================
   RENDER FILES
========================================================= */

function renderFiles() {

  const row = $("#tenderFileRow");

  if (state.tender) {

    if (row) {
      row.classList.remove("hidden");
    }

    if ($("#tenderName")) {

      $("#tenderName").textContent =
        state.tender.filename ||
        "Tender document";
    }

    if ($("#tenderStatus")) {

      const count =
        state.tender.total_requirements ??
        (
          Array.isArray(
            state.tender.requirements
          )
            ? state.tender.requirements.length
            : 0
        );

      $("#tenderStatus").textContent =
        `${count} requirements detected`;
    }

    if ($("#tenderDrop")) {
      $("#tenderDrop").classList.add(
        "hidden"
      );
    }

  } else {

    if (row) {
      row.classList.add("hidden");
    }

    if ($("#tenderDrop")) {
      $("#tenderDrop").classList.remove(
        "hidden"
      );
    }
  }


  const list = $("#bidderList");

  if (!list) return;

  list.innerHTML = "";


  state.bidder.forEach(
    (item, index) => {

      const div =
        document.createElement("div");

      div.className = "file-row";

      div.innerHTML = `

        <span class="file-icon">
          PDF
        </span>

        <div>

          <b>
            ${escapeHtml(
              item.filename ||
              `Bidder ${index + 1}`
            )}
          </b>

          <small>
            Evidence extracted
          </small>

        </div>

        <button
          class="remove-file"
          data-index="${index}"
          type="button"
        >
          ×
        </button>

      `;

      list.appendChild(div);
    }
  );


  list
    .querySelectorAll("[data-index]")
    .forEach(btn => {

      btn.onclick = () => {

        const index =
          Number(btn.dataset.index);

        state.bidder.splice(
          index,
          1
        );

        rebuildCombinedExtracted();

        renderFiles();
        renderEvidence();

        toast(
          "Bidder document removed"
        );
      };

    });
}


/* =========================================================
   COMBINE EXTRACTED DATA
========================================================= */

function rebuildCombinedExtracted() {

  state.extracted = {};

  state.bidder.forEach(
    bidder => {

      Object.entries(
        bidder.extracted || {}
      ).forEach(
        ([key, value]) => {

          if (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== "" &&
            state.extracted[key] == null
          ) {

            state.extracted[key] =
              value;
          }
        }
      );
    }
  );
}


/* =========================================================
   UPLOAD TENDER
========================================================= */

async function uploadTender(file) {

  if (!file) return;

  try {

    setBusy(
      true,
      "Reading tender requirements…"
    );

    const data =
      await apiUpload(
        file,
        "tender"
      );

    state.tender = data;

    state.requirements =
      Array.isArray(
        data.requirements
      )
        ? data.requirements
        : [];

    renderFiles();

    toast(
      "Tender uploaded successfully"
    );

  } catch (error) {

    console.error(error);

    toast(
      error.message ||
      "Tender upload failed"
    );

  } finally {

    setBusy(
      false,
      "Tender ready — add bidder evidence"
    );
  }
}


/* =========================================================
   UPLOAD BIDDER
========================================================= */

async function uploadBidder(files) {

  const arr = [...files];

  if (!arr.length) return;

  try {

    setBusy(
      true,
      `Extracting ${arr.length} bidder document${
        arr.length > 1 ? "s" : ""
      }…`
    );

    for (const file of arr) {

      const data =
        await apiUpload(
          file,
          "bidder"
        );

      state.bidder.push({

        filename:
          data.filename ||
          file.name,

        extracted:
          data.extracted ||
          {},

        file: file,

        uploadData:
          data
      });
    }

    rebuildCombinedExtracted();

    renderFiles();
    renderEvidence();

    toast(
      `${arr.length} bidder document${
        arr.length > 1 ? "s" : ""
      } extracted successfully`
    );

  } catch (error) {

    console.error(error);

    toast(
      error.message ||
      "Bidder upload failed"
    );

  } finally {

    setBusy(
      false,
      "Documents ready for analysis"
    );
  }
}


/* =========================================================
   RISK
========================================================= */

function calculateOverallRisk(reports) {

  const risks =
    reports.map(
      report =>
        String(
          report.result?.risk ||
          ""
        ).toLowerCase()
    );

  if (risks.includes("high")) {
    return "High";
  }

  if (risks.includes("medium")) {
    return "Medium";
  }

  if (risks.includes("low")) {
    return "Low";
  }

  return "—";
}


/* =========================================================
   RUN ANALYSIS
========================================================= */

async function runAnalysis() {

  if (!state.bidder.length) {

    toast(
      "Upload at least one bidder PDF first"
    );

    return;
  }

  if (
    !Array.isArray(
      state.requirements
    ) ||
    !state.requirements.length
  ) {

    toast(
      "Upload the tender PDF first"
    );

    return;
  }


  try {

    setBusy(
      true,
      "Running bidder compliance analysis…"
    );

    const reports = [];


    for (
      let i = 0;
      i < state.bidder.length;
      i++
    ) {

      const bidder =
        state.bidder[i];

      setBusy(
        true,
        `Analysing bidder ${
          i + 1
        } of ${
          state.bidder.length
        }…`
      );


      const result =
        await apiAnalyze(
          bidder.extracted || {},
          state.requirements
        );


      reports.push({

        bidderIndex:
          i + 1,

        bidderName:
          bidder.filename ||
          `Bidder ${i + 1}`,

        extracted:
          bidder.extracted ||
          {},

        result:
          result
      });
    }


    const overall = {

      Compliant: 0,

      "Non-Compliant": 0,

      Pending: 0
    };


    const allRequirements = [];


    reports.forEach(
      report => {

        const counts =
          report.result?.counts ||
          {};


        overall.Compliant +=
          Number(
            counts.Compliant ||
            0
          );


        overall["Non-Compliant"] +=
          Number(
            counts["Non-Compliant"] ||
            0
          );


        overall.Pending +=
          Number(
            counts.Pending ||
            0
          );


        (
          report.result?.requirements ||
          []
        ).forEach(
          requirement => {

            allRequirements.push({

              ...requirement,

              bidder:
                report.bidderName,

              bidderIndex:
                report.bidderIndex
            });
          }
        );
      }
    );


    const totalChecks =
      allRequirements.length;


    const complianceScore =
      totalChecks > 0

        ? Math.round(
            (
              overall.Compliant /
              totalChecks
            ) * 100
          )

        : 0;


    state.result = {

      bidderReports:
        reports,

      counts:
        overall,

      requirements:
        allRequirements,

      totalChecks:
        totalChecks,

      compliance_score:
        complianceScore,

      risk:
        calculateOverallRisk(
          reports
        )
    };


    selectedBidderIndex =
      "all";


    renderResults(
      state.result
    );

    populateOfficerBidderSelect();

    renderAuditTrail(
      reports
    );


    if ($("#analysis")) {

      $("#analysis").scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }


    toast(
      "Individual bidder analysis complete"
    );

  } catch (error) {

    console.error(
      "ANALYSIS ERROR:",
      error
    );

    toast(
      error.message ||
      "Analysis failed — check API server"
    );

  } finally {

    setBusy(
      false,
      "Analysis complete"
    );
  }
}


/* =========================================================
   UPDATE DASHBOARD SUMMARY
========================================================= */

function updateSummary(
  reports,
  overallRisk
) {

  const counts = {

    Compliant: 0,

    "Non-Compliant": 0,

    Pending: 0
  };


  let total = 0;


  reports.forEach(
    report => {

      const c =
        report.result?.counts ||
        {};


      counts.Compliant +=
        Number(
          c.Compliant ||
          0
        );


      counts["Non-Compliant"] +=
        Number(
          c["Non-Compliant"] ||
          0
        );


      counts.Pending +=
        Number(
          c.Pending ||
          0
        );


      total +=
        (
          report.result?.requirements ||
          []
        ).length;
    }
  );


  const complianceScore =
    total > 0

      ? Math.round(
          (
            counts.Compliant /
            total
          ) * 100
        )

      : 0;


  if ($("#mCompliant")) {
    $("#mCompliant").textContent =
      counts.Compliant;
  }

  if ($("#mNon")) {
    $("#mNon").textContent =
      counts["Non-Compliant"];
  }

  if ($("#mPending")) {
    $("#mPending").textContent =
      counts.Pending;
  }

  if ($("#mTotal")) {
    $("#mTotal").textContent =
      total;
  }

  if ($("#mScore")) {
    $("#mScore").textContent =
      `${complianceScore}%`;
  }

  if ($("#riskValue")) {
    $("#riskValue").textContent =
      overallRisk || "—";
  }


  if ($("#riskText")) {

    $("#riskText").textContent =

      overallRisk === "High"

        ? "Immediate review required for non-compliant checks."

        : overallRisk === "Medium"

        ? "Some evidence is still missing or unresolved."

        : overallRisk === "Low"

        ? "All evaluated checks currently have supporting evidence."

        : "Run an analysis to calculate the current review state.";
  }


  if ($("#riskFill")) {

    $("#riskFill").style.width =

      overallRisk === "High"

        ? "92%"

        : overallRisk === "Medium"

        ? "58%"

        : overallRisk === "Low"

        ? "24%"

        : "0%";
  }
}


/* =========================================================
   BIDDER FILTER
========================================================= */

function renderFilter(data) {

  const box =
    $("#bidderFilterBox");

  const select =
    $("#bidderFilterSelect");

  if (!box || !select) {
    return;
  }


  const reports =
    data.bidderReports ||
    [];


  if (!reports.length) {

    box.style.display =
      "none";

    return;
  }


  select.innerHTML =

    `<option value="all">
      All Bidders
    </option>` +

    reports
      .map(
        report => `

          <option
            value="${escapeHtml(
              report.bidderIndex
            )}"
          >
            Bidder ${escapeHtml(
              report.bidderIndex
            )}
            — ${escapeHtml(
              report.bidderName
            )}
          </option>

        `
      )
      .join("");


  select.value =
    selectedBidderIndex;


  box.style.display =
    "block";


  select.onchange = () => {

    selectedBidderIndex =
      select.value;

    renderResults(data);
  };
}


/* =========================================================
   RENDER RESULTS
========================================================= */

function renderResults(data) {

  const allReports =
    data.bidderReports ||
    [];


  const reports =

    selectedBidderIndex === "all"

      ? allReports

      : allReports.filter(
          report =>
            String(
              report.bidderIndex
            ) ===
            String(
              selectedBidderIndex
            )
        );


  const risk =

    selectedBidderIndex === "all"

      ? (
          data.risk ||
          "—"
        )

      : calculateOverallRisk(
          reports
        );


  updateSummary(
    reports,
    risk
  );


  renderFilter(data);


  const body =
    $("#resultsBody");


  if (!body) {
    return;
  }


  body.innerHTML = "";


  if (!reports.length) {

    body.innerHTML = `

      <tr>

        <td colspan="5">

          <div class="empty-state">

            <b>
              No bidder report found
            </b>

            <span>
              Select another bidder.
            </span>

          </div>

        </td>

      </tr>

    `;

    return;
  }


  reports.forEach(
    report => {

      const heading =
        document.createElement("tr");


      heading.innerHTML = `

        <td
          colspan="5"
          style="
            font-weight:700;
            font-size:16px;
            padding:18px 12px;
            background:#f5f3ff;
            color:#4f46e5;
          "
        >

          BIDDER
          ${escapeHtml(
            report.bidderIndex
          )}

          —

          ${escapeHtml(
            report.bidderName
          )}

        </td>

      `;


      body.appendChild(
        heading
      );


      const c =
        report.result?.counts ||
        {};


      const total =

        Number(
          c.Compliant || 0
        ) +

        Number(
          c["Non-Compliant"] || 0
        ) +

        Number(
          c.Pending || 0
        );


      const bidderScore =

        report.result?.compliance_score !==
        undefined

          ? report.result.compliance_score

          : total > 0

          ? Math.round(
              (
                Number(
                  c.Compliant || 0
                ) /
                total
              ) * 100
            )

          : 0;


      const summary =
        document.createElement("tr");


      summary.innerHTML = `

        <td
          colspan="5"
          style="
            padding:12px;
            background:#fafafa;
          "
        >

          <strong>
            Bidder Summary:
          </strong>

          &nbsp;

          Compliant:
          ${c.Compliant ?? 0}

          &nbsp; | &nbsp;

          Non-Compliant:
          ${c["Non-Compliant"] ?? 0}

          &nbsp; | &nbsp;

          Pending:
          ${c.Pending ?? 0}

          &nbsp; | &nbsp;

          Score:
          ${bidderScore}%

          &nbsp; | &nbsp;

          Risk:
          ${escapeHtml(
            report.result?.risk ||
            "—"
          )}

        </td>

      `;


      body.appendChild(
        summary
      );


      (
        report.result?.requirements ||
        []
      ).forEach(
        requirement => {

          const tr =
            document.createElement("tr");


          const cls =
            String(
              requirement.status ||
              ""
            )
              .toLowerCase()
              .replace(
                /\s+/g,
                "-"
              );


          const originalName =
            requirement.name ||
            requirement.requirement ||
            "—";


          const displayName =
            getRequirementDisplayName(
              originalName
            );


          tr.innerHTML = `

            <td>

              ${escapeHtml(
                displayName
              )}

            </td>


            <td>

              ${escapeHtml(
                requirement.category ||
                requirement.type ||
                "—"
              )}

            </td>


            <td>

              <span
                class="status-chip ${cls}"
              >

                ${escapeHtml(
                  requirement.status ||
                  "—"
                )}

              </span>

            </td>


            <td class="reason">

              ${escapeHtml(
                requirement.reason ||
                "—"
              )}

            </td>


            <td class="evidence-ref">

              ${escapeHtml(
                requirement.evidence ||
                "—"
              )}

            </td>

          `;


          body.appendChild(tr);
        }
      );
    }
  );
}


/* =========================================================
   EVIDENCE
========================================================= */

function renderEvidence() {

  const grid =
    $("#evidenceGrid");

  if (!grid) {
    return;
  }


  grid.innerHTML = "";


  if (!state.bidder.length) {

    grid.innerHTML = `

      <div class="evidence-empty">
        No extracted evidence yet.
      </div>

    `;

    return;
  }


  const keys = [

    "gstin",
    "pan",
    "udyam",

    "company_profile",
    "oem_authorization",
    "experience",

    "no_blacklisting",
    "technical_compliance",

    "make_in_india",
    "epfo",
    "esic",
    "startup_india",
    "nsic"

  ];


  const labels = {

    gstin:
      "GSTIN",

    pan:
      "PAN",

    udyam:
      "Udyam / MSME",

    company_profile:
      "Company Profile",

    oem_authorization:
      "Original Equipment Manufacturer (OEM) Authorization",

    experience:
      "Experience",

    no_blacklisting:
      "No Blacklisting",

    technical_compliance:
      "Technical Compliance",

    make_in_india:
      "Make in India / Local Content",

    epfo:
      "Employees' Provident Fund Organisation (EPFO) Compliance",

    esic:
      "Employees' State Insurance Corporation (ESIC) Compliance",

    startup_india:
      "Startup India",

    nsic:
      "National Small Industries Corporation (NSIC) Registration"
  };


  state.bidder.forEach(
    (bidder, index) => {

      const title =
        document.createElement("div");


      title.style.gridColumn =
        "1 / -1";


      title.style.marginTop =
        index === 0
          ? "0"
          : "28px";


      title.innerHTML = `

        <h3
          style="
            margin:0;
            font-size:18px;
            color:#4f46e5;
          "
        >
          Bidder ${index + 1}
        </h3>


        <p
          style="
            margin:5px 0 12px;
            color:#6b7280;
          "
        >

          ${escapeHtml(
            bidder.filename ||
            `Bidder ${index + 1}`
          )}

        </p>

      `;


      grid.appendChild(title);


      let shown = 0;


      keys.forEach(
        key => {

          const value =
            bidder.extracted?.[key];


          if (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
          ) {

            shown++;


            const card =
              document.createElement("div");


            card.className =
              "evidence-card";


            card.innerHTML = `

              <small>
                ${escapeHtml(
                  labels[key] || key
                )}
              </small>

              <b>
                Extracted value
              </b>

              <div
                class="evidence-value"
              >

                ${escapeHtml(value)}

              </div>

            `;


            grid.appendChild(card);
          }
        }
      );


      if (!shown) {

        const empty =
          document.createElement("div");


        empty.style.gridColumn =
          "1 / -1";


        empty.className =
          "evidence-empty";


        empty.textContent =
          "No extracted evidence found for this bidder.";


        grid.appendChild(empty);
      }
    }
  );
}


/* =========================================================
   AUDIT TRAIL
========================================================= */

function renderAuditTrail(reports) {

  const card =
    $("#auditTrailCard");

  const status =
    $("#auditStatus");

  const content =
    $("#auditTrailContent");


  if (
    !card ||
    !status ||
    !content
  ) {
    return;
  }


  if (
    !reports ||
    !reports.length
  ) {

    status.textContent =
      "No analysis yet";

    content.textContent =
      "Run an analysis to generate the audit trail.";

    return;
  }


  status.textContent =
    "Generated";


  let html = "";


  reports.forEach(
    (report, index) => {

      const audit =
        report.result?.audit_trail;


      if (!audit) {

        html += `

          <div
            style="
              padding:14px;
              margin-bottom:12px;
              border:1px solid #e5e7eb;
              border-radius:12px;
            "
          >

            <strong>
              Bidder ${index + 1}
            </strong>

            <p
              style="
                margin:6px 0;
                color:#6b7280;
              "
            >
              Audit information was not
              returned by the backend.
            </p>

          </div>

        `;

        return;
      }


      html += `

        <div
          style="
            padding:16px;
            margin-bottom:14px;
            border:1px solid #e5e7eb;
            border-radius:14px;
            background:#fafafa;
          "
        >

          <div
            style="
              display:flex;
              justify-content:space-between;
              gap:12px;
              flex-wrap:wrap;
              margin-bottom:12px;
            "
          >

            <strong>

              Bidder ${escapeHtml(
                report.bidderIndex
              )}

              —

              ${escapeHtml(
                report.bidderName
              )}

            </strong>


            <span>

              ${escapeHtml(
                audit.analysis_id ||
                "Audit ID unavailable"
              )}

            </span>

          </div>


          <div
            style="
              display:grid;
              grid-template-columns:
                repeat(
                  auto-fit,
                  minmax(180px, 1fr)
                );
              gap:10px;
            "
          >

            <div>

              <small>
                Timestamp
              </small>

              <div>

                ${escapeHtml(
                  audit.timestamp_utc ||
                  "—"
                )}

              </div>

            </div>


            <div>

              <small>
                Verification Mode
              </small>

              <div>

                ${escapeHtml(
                  audit.verification_mode ||
                  "—"
                )}

              </div>

            </div>


            <div>

              <small>
                Total Checks
              </small>

              <div>

                ${escapeHtml(
                  audit.total_checks ??
                  "—"
                )}

              </div>

            </div>


            <div>

              <small>
                Compliant
              </small>

              <div>

                ${escapeHtml(
                  audit.compliant ??
                  "—"
                )}

              </div>

            </div>


            <div>

              <small>
                Non-Compliant
              </small>

              <div>

                ${escapeHtml(
                  audit.non_compliant ??
                  "—"
                )}

              </div>

            </div>


            <div>

              <small>
                Pending
              </small>

              <div>

                ${escapeHtml(
                  audit.pending ??
                  "—"
                )}

              </div>

            </div>


            <div>

              <small>
                Compliance Score
              </small>

              <div>

                ${escapeHtml(
                  audit.compliance_score ??
                  "—"
                )}%

              </div>

            </div>


            <div>

              <small>
                Risk
              </small>

              <div>

                ${escapeHtml(
                  audit.risk ||
                  "—"
                )}

              </div>

            </div>

          </div>


          <div
            style="
              margin-top:14px;
              padding-top:12px;
              border-top:1px solid #e5e7eb;
            "
          >

            <small>
              AI Recommendation
            </small>


            <p
              style="
                margin:6px 0;
              "
            >

              ${escapeHtml(
                audit.ai_recommendation ||
                "—"
              )}

            </p>

          </div>


          <div
            style="
              margin-top:10px;
              color:#6b7280;
              font-size:13px;
            "
          >

            Final Decision:

            <strong>

              ${escapeHtml(
                audit.final_decision ||
                "Pending Procurement Officer Review"
              )}

            </strong>

          </div>

        </div>

      `;
    }
  );


  content.innerHTML =
    html;
}

/* =========================================================
   PROCUREMENT OFFICER REVIEW
========================================================= */

function getBidderReports() {
  return state.result?.bidderReports || [];
}

function populateOfficerBidderSelect() {

  const select = $("#officerBidderSelect");

  if (!select) return;

  const reports = getBidderReports();

  if (!reports.length) {

    select.innerHTML = `
      <option value="">
        Run analysis first
      </option>
    `;

    return;
  }

  select.innerHTML = reports.map(report => `

    <option value="${escapeHtml(report.bidderIndex)}">
      Bidder ${escapeHtml(report.bidderIndex)}
      — ${escapeHtml(report.bidderName)}
    </option>

  `).join("");

  select.value = String(
    selectedBidderIndex === "all"
      ? reports[0].bidderIndex
      : selectedBidderIndex
  );

  updateOfficerReview();
}


function getSelectedOfficerReport() {

  const reports = getBidderReports();

  const select = $("#officerBidderSelect");

  if (!select || !select.value) {
    return null;
  }

  return reports.find(
    report =>
      String(report.bidderIndex) ===
      String(select.value)
  ) || null;
}


function updateOfficerReview() {

  const report =
    getSelectedOfficerReport();

  const scoreEl =
    $("#officerScore");

  const riskEl =
    $("#officerRisk");

  const recommendationEl =
    $("#officerRecommendation");

  const statusEl =
    $("#officerReviewStatus");

  const decisionEl =
    $("#officerDecision");

  const remarksEl =
    $("#officerRemarks");

  const recordEl =
    $("#officerDecisionRecord");

  const recordTextEl =
    $("#officerDecisionRecordText");


  if (!report) {

    if (scoreEl) {
      scoreEl.textContent = "—";
    }

    if (riskEl) {
      riskEl.textContent = "—";
    }

    if (recommendationEl) {
      recommendationEl.textContent =
        "Run analysis to view AI recommendation.";
    }

    if (decisionEl) {
      decisionEl.value = "";
    }

    if (remarksEl) {
      remarksEl.value = "";
    }

    if (recordEl) {
      recordEl.style.display = "none";
    }

    return;
  }


  const result =
    report.result || {};

  const counts =
    result.counts || {};


  const total =
    Number(counts.Compliant || 0) +
    Number(counts["Non-Compliant"] || 0) +
    Number(counts.Pending || 0);


  const score =
    result.compliance_score !== undefined
      ? result.compliance_score
      : total > 0
        ? Math.round(
            (
              Number(counts.Compliant || 0) /
              total
            ) * 100
          )
        : 0;


  const risk =
    result.risk || "—";


  const recommendation =
    result.audit_trail?.ai_recommendation ||
    "No AI recommendation available.";


  if (scoreEl) {
    scoreEl.textContent =
      `${score}%`;
  }


  if (riskEl) {
    riskEl.textContent =
      risk;
  }


  if (recommendationEl) {
    recommendationEl.textContent =
      recommendation;
  }


  const savedDecision =
    state.officerDecisions[
      String(report.bidderIndex)
    ];


  /* =====================================================
     EXISTING BIDDER WITH SAVED DECISION
  ===================================================== */

  if (savedDecision) {

    if (decisionEl) {
      decisionEl.value =
        savedDecision.decision;
    }

    if (remarksEl) {
      remarksEl.value =
        savedDecision.remarks;
    }

    if (statusEl) {
      statusEl.textContent =
        "Decision Recorded";

      statusEl.style.background =
        "#ecfdf5";

      statusEl.style.color =
        "#047857";
    }

    if (recordEl) {
      recordEl.style.display =
        "block";
    }

    if (recordTextEl) {

      recordTextEl.innerHTML = `

        <b>Decision:</b>
        ${escapeHtml(savedDecision.decision)}

        <br>

        <b>Remarks:</b>
        ${escapeHtml(savedDecision.remarks)}

        <br>

        <b>Recorded At:</b>
        ${escapeHtml(savedDecision.timestamp)}

      `;

    }

  }


  /* =====================================================
     NEW BIDDER — CLEAR PREVIOUS BIDDER'S REVIEW
  ===================================================== */

  else {

    if (decisionEl) {
      decisionEl.value = "";
    }

    if (remarksEl) {
      remarksEl.value = "";
    }

    if (statusEl) {
      statusEl.textContent =
        "Not Yet Reviewed";

      statusEl.style.background =
        "";

      statusEl.style.color =
        "";
    }

    if (recordEl) {
      recordEl.style.display =
        "none";
    }

    if (recordTextEl) {
      recordTextEl.innerHTML = "";
    }

  }

}


function submitOfficerDecision() {

  if (!state.result) {
    toast("Run analysis first");
    return;
  }

  const report =
    getSelectedOfficerReport();

  if (!report) {
    toast("Select a bidder first");
    return;
  }

  const decision =
    $("#officerDecision")?.value || "";

  let remarks =
    $("#officerRemarks")?.value.trim() || "";

  if (!decision) {
    toast("Select a final procurement decision");
    return;
  }

  /* AUTOMATIC REMARKS */

  if (!remarks) {

    if (decision === "Qualified") {

      remarks =
        "All required compliance checks have been reviewed and the bidder may proceed subject to procurement rules.";

    } else if (decision === "Disqualified") {

      remarks =
        "The bidder has unresolved non-compliance identified during verification and does not meet the required conditions.";

    } else if (decision === "Clarification Required") {

      remarks =
        "Additional clarification or supporting documents are required before the procurement decision can be finalized.";

    } else {

      remarks =
        "Procurement Officer reviewed the bidder compliance results and recorded the final decision.";

    }
  }

  const timestamp =
    new Date().toISOString();


  /* SAVE THIS BIDDER'S DECISION */

  state.officerDecisions[
    String(report.bidderIndex)
  ] = {

    bidder_index:
      report.bidderIndex,

    bidder_name:
      report.bidderName,

    decision:
      decision,

    remarks:
      remarks,

    timestamp:
      timestamp,

    officer_role:
      "Procurement Officer"
  };


  /* UPDATE CURRENT BIDDER AUDIT TRAIL */

  if (!report.result.audit_trail) {
    report.result.audit_trail = {};
  }

  report.result.audit_trail.final_decision =
    decision;

  report.result.audit_trail.final_decision_remarks =
    remarks;

  report.result.audit_trail.officer_review = {

    status:
      "Decision Recorded",

    decision:
      decision,

    remarks:
      remarks,

    recorded_at:
      timestamp,

    officer_role:
      "Procurement Officer"
  };


  /* SAVE ALL OFFICER DECISIONS */

  state.result.officer_decisions =
    Object.values(
      state.officerDecisions
    );

  state.result.officer_review_summary = {

    total_bidders:
      state.result.bidderReports?.length || 0,

    decisions_recorded:
      state.result.officer_decisions.length,

    pending_decisions:
      Math.max(
        0,
        (state.result.bidderReports?.length || 0) -
        state.result.officer_decisions.length
      )
  };


  /* REFRESH UI */

  updateOfficerReview();

  renderAuditTrail(
    state.result.bidderReports
  );

  toast(
    `Decision recorded for Bidder ${report.bidderIndex}`
  );

}




/* =========================================================
   CLEAR SESSION
========================================================= */

function clearSession() {

  state.tender = null;

  state.bidder = [];

  state.extracted = {};

  state.requirements = null;

  state.result = null;


  selectedBidderIndex =
    "all";


  const filterBox =
    $("#bidderFilterBox");


  if (filterBox) {

    filterBox.style.display =
      "none";
  }


  renderFiles();
  renderEvidence();


  if ($("#resultsBody")) {

    $("#resultsBody").innerHTML = `

      <tr class="empty-row">

        <td colspan="5">

          <div class="empty-state">

            <b>
              No analysis yet
            </b>

            <span>
              Upload documents and run
              the compliance engine.
            </span>

          </div>

        </td>

      </tr>

    `;
  }


  if ($("#mCompliant")) {
    $("#mCompliant").textContent = "0";
  }

  if ($("#mNon")) {
    $("#mNon").textContent = "0";
  }

  if ($("#mPending")) {
    $("#mPending").textContent = "0";
  }

  if ($("#mTotal")) {
    $("#mTotal").textContent = "0";
  }

  if ($("#mScore")) {
    $("#mScore").textContent = "0%";
  }

  if ($("#riskValue")) {
    $("#riskValue").textContent = "—";
  }

  if ($("#riskText")) {
    $("#riskText").textContent =
      "Run an analysis to calculate the current review state.";
  }

  if ($("#riskFill")) {
    $("#riskFill").style.width = "0%";
  }

  if ($("#auditStatus")) {
    $("#auditStatus").textContent =
      "No analysis yet";
  }

  if ($("#auditTrailContent")) {
    $("#auditTrailContent").textContent =
      "Run an analysis to generate the audit trail.";
  }


  toast(
    "Session cleared"
  );
}


/* =========================================================
   EXPORT JSON
========================================================= */

function exportJSON() {

  if (!state.result) {

    toast(
      "Run an analysis first"
    );

    return;
  }


  /* =====================================================
     COLLECT ALL PROCUREMENT OFFICER DECISIONS
  ===================================================== */

  const officerDecisions =
    Object.values(
      state.officerDecisions || {}
    );


  const bidderReports =
    state.result.bidderReports || [];


  /* =====================================================
     CREATE FINAL PROCUREMENT OFFICER REPORT
  ===================================================== */

  const officerReport = {

    report_title:
      "GeM Procurement Officer Final Review Report",

    generated_at:
      new Date().toISOString(),

    verification_mode:
      "Synthetic Government Sandbox",

    total_bidders:
      bidderReports.length,

    decisions_recorded:
      officerDecisions.length,

    pending_decisions:
      Math.max(
        0,
        bidderReports.length -
        officerDecisions.length
      ),

    bidder_reports:
      bidderReports,

    procurement_officer_decisions:
      officerDecisions,

    final_decision_status:
      officerDecisions.length === bidderReports.length
        ? "All Bidder Decisions Recorded"
        : "Some Bidder Decisions Pending"

  };


  /* =====================================================
     DOWNLOAD FINAL REPORT
  ===================================================== */

  const blob =
    new Blob(
      [
        JSON.stringify(
          officerReport,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const a =
    document.createElement("a");


  a.href =
    url;


  a.download =
    "gem-procurement-officer-final-review-report.json";


  document.body.appendChild(a);


  a.click();


  a.remove();


  URL.revokeObjectURL(url);


  toast(
    "Procurement Officer Final Review Report generated"
  );

}


/* =========================================================
   EVENT HANDLERS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {


    /* =====================================================
       TENDER UPLOAD
    ===================================================== */

    const tenderInput =
      $("#tenderFile");


    if (tenderInput) {

      tenderInput.addEventListener(
        "change",
        event => {

          uploadTender(
            event.target.files[0]
          );

          event.target.value = "";
        }
      );
    }


    /* =====================================================
       BIDDER UPLOAD
    ===================================================== */

    const bidderInput =
      $("#bidderFiles");


    if (bidderInput) {

      bidderInput.addEventListener(
        "change",
        event => {

          uploadBidder(
            event.target.files
          );

          event.target.value = "";
        }
      );
    }


    /* =====================================================
       ANALYZE
    ===================================================== */

    const analyzeBtn =
      $("#analyzeBtn");


    if (analyzeBtn) {

      analyzeBtn.addEventListener(
        "click",
        runAnalysis
      );
    }


    /* =====================================================
       CLEAR
    ===================================================== */

    const clearBtn =
      $("#clearBtn");


    if (clearBtn) {

      clearBtn.addEventListener(
        "click",
        clearSession
      );
    }


    /* =====================================================
       EXPORT
    ===================================================== */

    const exportBtn =
      $("#exportBtn");


    if (exportBtn) {

      exportBtn.addEventListener(
        "click",
        exportJSON
      );
    }

/* =====================================================
   PROCUREMENT OFFICER REVIEW
===================================================== */

const officerBidderSelect =
  $("#officerBidderSelect");

if (officerBidderSelect) {
  officerBidderSelect.addEventListener(
    "change",
    () => {
      updateOfficerReview();
    }
  );
}

const submitOfficerBtn =
  $("#submitOfficerDecision");

if (submitOfficerBtn) {
  submitOfficerBtn.addEventListener(
    "click",
    submitOfficerDecision
  );
}

    /* =====================================================
       INITIAL UI
    ===================================================== */

    renderFiles();

    renderEvidence();

  }
);