/* ============================================
   PATCHES MODULE - Bug fixes and enhancements
   ============================================ */

(function() {
    'use strict';

    function whenReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            setTimeout(fn, 0);
        }
    }

    // Parse all slots from schedule string
    function parseAllSlots(scheduleString) {
        if (!scheduleString) return [{ day: DAYS_OF_WEEK[0], time: TIME_SLOTS[0] }];
        var parts = String(scheduleString).split(';').map(function(p) { return p.trim(); }).filter(Boolean);
        var slots = [];
        parts.forEach(function(part) {
            for (var i = 0; i < DAYS_OF_WEEK.length; i++) {
                var d = DAYS_OF_WEEK[i];
                if (part.indexOf(d) === 0 || part.includes(d)) {
                    var rest = part.substring(d.length).trim();
                    var t = TIME_SLOTS.indexOf(rest) >= 0 ? rest : TIME_SLOTS[0];
                    slots.push({ day: d, time: t });
                    return;
                }
            }
        });
        return slots.length ? slots : [{ day: DAYS_OF_WEEK[0], time: TIME_SLOTS[0] }];
    }

    function buildScheduleStringMulti(slots) {
        return slots.map(function(s) { return s.day + ' ' + s.time; }).join('; ');
    }

    // Detect schedule clashes - UPDATED to use global function if available
    function detectClashes(subjects) {
        if (typeof window.getAllConflicts === 'function') {
            const conflicts = window.getAllConflicts(subjects);
            const clashMap = {};
            conflicts.forEach(c => {
                const key = c.subject1.name;
                if (!clashMap[key]) clashMap[key] = [];
                clashMap[key].push(c.subject2.name);
            });
            return Object.keys(clashMap).map(name => ({ names: [name, ...clashMap[name]] }));
        }
        
        var grid = {};
        subjects.forEach(function(s) {
            var slots = parseAllSlots(s.schedule);
            slots.forEach(function(slot) {
                var key = slot.day + '|' + slot.time;
                if (!grid[key]) grid[key] = [];
                grid[key].push(s.name);
            });
        });
        var out = [];
        Object.keys(grid).forEach(function(k) {
            if (grid[k].length > 1) {
                var parts = k.split('|');
                out.push({ day: parts[0], time: parts[1], names: grid[k].slice() });
            }
        });
        return out;
    }

    // Apply clash highlights to editor
    function applyEditorClashHighlights(draft, container) {
        if (!container || !Array.isArray(draft)) return;
        var clashes = detectClashes(draft);
        var clashingNames = {};
        clashes.forEach(function(c) {
            (c.names || []).forEach(function(n) { clashingNames[n] = true; });
        });
        container.querySelectorAll('.subject-editor-row').forEach(function(row) {
            var idx = parseInt(row.getAttribute('data-row-idx'), 10);
            var name = (!isNaN(idx) && draft[idx]) ? draft[idx].name : null;
            if (name && clashingNames[name]) {
                row.classList.add('clash');
            } else {
                row.classList.remove('clash');
            }
        });
    }

    // Patched subject editor renderer
    function renderSubjectScheduleEditorPatched() {
        var container = document.getElementById('subjectEditorList');
        var wrapper = document.getElementById('subjectScheduleEditor');
        var slotIndicator = document.getElementById('scheduleSlotIndicator');
        if (!container || !wrapper) return;
        if (!window.currentUser || window.currentUser.type !== 'student') {
            wrapper.style.display = 'none';
            if (slotIndicator) slotIndicator.style.display = 'none';
            return;
        }
        var draft = window.scheduleDraft;
        if (!draft || draft.length === 0) {
            wrapper.style.display = 'none';
            if (slotIndicator) slotIndicator.style.display = 'none';
            return;
        }

        if (slotIndicator) {
            slotIndicator.style.display = 'flex';
            var remEl = document.getElementById('slotsRemainingDisplay');
            var limEl = document.getElementById('slotsLimitDisplay');
            if (remEl && window.currentUser.data) {
                ensureSlotFields(window.currentUser.data);
                remEl.textContent = getSlotsRemaining(window.currentUser.data);
            }
            if (limEl && window.currentUser.data) limEl.textContent = window.currentUser.data.scheduleChangeLimit;
        }

        wrapper.style.display = 'block';
        var defaultSched = window.currentUser.data.defaultSchedule || [];
        var html = '';
        
        draft.forEach(function(subj, idx) {
            var slots = parseAllSlots(subj.schedule);
            var defaultSubj = defaultSched[idx];
            var defaultSlots = defaultSubj ? parseAllSlots(defaultSubj.schedule) : slots;
            var dirty = false;
            for (var i = 0; i < slots.length; i++) {
                var ds = defaultSlots[i] || slots[i];
                if (slots[i].day !== ds.day || slots[i].time !== ds.time) { dirty = true; break; }
            }
            var multi = slots.length > 1;
            
            // Check if this subject conflicts with others
            var hasConflict = false;
            for (var j = 0; j < draft.length; j++) {
                if (j === idx) continue;
                var otherSlots = parseAllSlots(draft[j].schedule);
                for (var a = 0; a < slots.length; a++) {
                    for (var b = 0; b < otherSlots.length; b++) {
                        if (slots[a].day === otherSlots[b].day && slots[a].time === otherSlots[b].time) {
                            hasConflict = true;
                            break;
                        }
                    }
                    if (hasConflict) break;
                }
                if (hasConflict) break;
            }
            
            var conflictClass = hasConflict ? 'has-conflict' : '';
            var glowClass = dirty ? 'dirty-glow' : (hasConflict ? 'conflict-glow' : '');
            
            var slotRowsHtml = slots.map(function(slot, sIdx) {
                // Check if THIS specific slot conflicts with any other slot in any other subject
                var thisSlotConflicts = false;
                for (var j = 0; j < draft.length; j++) {
                    if (j === idx) continue;
                    var otherSlots = parseAllSlots(draft[j].schedule);
                    for (var b = 0; b < otherSlots.length; b++) {
                        if (slot.day === otherSlots[b].day && slot.time === otherSlots[b].time) {
                            thisSlotConflicts = true;
                            break;
                        }
                    }
                    if (thisSlotConflicts) break;
                }
                var dayOpts = DAYS_OF_WEEK.map(function(d) {
                    return '<option value="' + d + '"' + (d === slot.day ? ' selected' : '') + '>' + d + '</option>';
                }).join('');
                var timeOpts = TIME_SLOTS.map(function(t) {
                    return '<option value="' + t + '"' + (t === slot.time ? ' selected' : '') + '>' + t + '</option>';
                }).join('');
                var sessionLabel = multi ? '<span class="session-pill' + (thisSlotConflicts ? ' conflict-pill' : '') + '">Session ' + (sIdx + 1) + '</span>' : '';
                var conflictTag = thisSlotConflicts ? '<span class="slot-conflict-tag"><i class="fas fa-triangle-exclamation"></i> Conflict</span>' : '';
                var slotStyle = thisSlotConflicts ? 'background:rgba(239,68,68,0.08);border:1.5px solid #ef4444;border-radius:10px;padding:6px 10px;' : '';
                return '<div class="subject-editor-slot' + (thisSlotConflicts ? ' slot-conflict' : '') + '" data-slot-idx="' + sIdx + '" style="' + slotStyle + '">' +
                    sessionLabel + conflictTag +
                    '<select class="subject-editor-day-multi" data-subj-idx="' + idx + '" data-slot-idx="' + sIdx + '">' + dayOpts + '</select>' +
                    '<select class="subject-editor-time-multi" data-subj-idx="' + idx + '" data-slot-idx="' + sIdx + '">' + timeOpts + '</select>' +
                    '</div>';
            }).join('');
            
            var conjoinedBadge = multi ? '<span class="session-count-badge"><i class="fas fa-calendar-days"></i> ' + slots.length + ' Independent Sessions</span>' : '';
            var statusIcon = dirty ? '<i class="fas fa-pen" style="color:#FFB347;"></i>' : (hasConflict ? '<i class="fas fa-exclamation-triangle" style="color:#ef4444;"></i>' : '<i class="fas fa-check-circle" style="color:#10B981;"></i>');
            
            html += '<div class="subject-editor-row ' + conflictClass + ' ' + glowClass + (dirty ? ' dirty' : '') + '" data-row-idx="' + idx + '" style="' + (hasConflict ? 'border: 2px solid #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);' : (dirty ? 'border: 2px solid #FFB347; box-shadow: 0 0 15px rgba(255, 179, 71, 0.5);' : 'border: 1px solid #f3e0c0;')) + '">' +
                '<div class="subject-editor-name">' + statusIcon + ' ' + escapeHtml(subj.name) + ' ' + conjoinedBadge + '<span class="clash-row-tag" style="display:none;"><i class="fas fa-triangle-exclamation"></i> Conflict</span></div>' +
                '<div class="subject-editor-slots">' + slotRowsHtml + '</div>' +
                '</div>';
        });
        container.innerHTML = html;
        applyEditorClashHighlights(draft, container);

        // Bind change events for conjoined slots
        container.querySelectorAll('.subject-editor-day-multi, .subject-editor-time-multi').forEach(function(sel) {
            sel.addEventListener('change', function() {
                var subjIdx = parseInt(this.getAttribute('data-subj-idx'), 10);
                var slotIdx = parseInt(this.getAttribute('data-slot-idx'), 10);
                if (isNaN(subjIdx) || !draft[subjIdx]) return;

                var oldSlots = parseAllSlots(draft[subjIdx].schedule);
                var slotEl = this.closest('.subject-editor-slot');
                var newDay = slotEl.querySelector('.subject-editor-day-multi').value;
                var newTime = slotEl.querySelector('.subject-editor-time-multi').value;

                // Independent per-slot update — only change the specific session the user edited
                var newSlots = oldSlots.map(function(s, i) {
                    return (i === slotIdx) ? { day: newDay, time: newTime } : { day: s.day, time: s.time };
                });
                draft[subjIdx].schedule = buildScheduleStringMulti(newSlots);

                if (typeof renderScheduleTable === 'function') renderScheduleTable(draft, 'scheduleResult');
                renderSubjectScheduleEditorPatched();
                
                // Check for conflicts after change
                setTimeout(function() {
                    var hasAnyConflict = false;
                    for (var i = 0; i < draft.length; i++) {
                        var subjSlots = parseAllSlots(draft[i].schedule);
                        for (var j = i + 1; j < draft.length; j++) {
                            var otherSlots = parseAllSlots(draft[j].schedule);
                            for (var a = 0; a < subjSlots.length; a++) {
                                for (var b = 0; b < otherSlots.length; b++) {
                                    if (subjSlots[a].day === otherSlots[b].day && subjSlots[a].time === otherSlots[b].time) {
                                        hasAnyConflict = true;
                                        break;
                                    }
                                }
                                if (hasAnyConflict) break;
                            }
                            if (hasAnyConflict) break;
                        }
                        if (hasAnyConflict) break;
                    }
                    
                    var submitBtn = document.getElementById('submitScheduleChangeBtn');
                    if (submitBtn) {
                        if (hasAnyConflict) {
                            submitBtn.disabled = true;
                            submitBtn.style.opacity = '0.5';
                            submitBtn.style.cursor = 'not-allowed';
                            if (typeof showCustomNotification === 'function') {
                                showCustomNotification('Schedule conflicts detected! Please resolve them before submitting.', 'warning');
                            }
                        } else {
                            submitBtn.disabled = false;
                            submitBtn.style.opacity = '1';
                            submitBtn.style.cursor = 'pointer';
                        }
                    }
                }, 50);
            });
        });
    }

    function getDirtySubjectsPatched() {
        if (!window.currentUser || !window.currentUser.data || !window.scheduleDraft) return [];
        var def = window.currentUser.data.defaultSchedule || [];
        var draft = window.scheduleDraft;
        var dirty = [];
        draft.forEach(function(subj, idx) {
            var cur = parseAllSlots(subj.schedule);
            var orig = def[idx] ? parseAllSlots(def[idx].schedule) : cur;
            var changed = false;
            var maxLen = Math.max(cur.length, orig.length);
            for (var i = 0; i < maxLen; i++) {
                var a = cur[i] || cur[0];
                var b = orig[i] || orig[0];
                if (a.day !== b.day || a.time !== b.time) { changed = true; break; }
            }
            if (changed) {
                dirty.push({
                    name: subj.name,
                    from: orig.map(function(s) { return s.day + ' ' + s.time; }).join('; '),
                    to: cur.map(function(s) { return s.day + ' ' + s.time; }).join('; ')
                });
            }
        });
        return dirty;
    }

    function submitScheduleChangeRequest() {
        if (!window.currentUser || window.currentUser.type !== 'student') return;
        if (!window.scheduleDraft || window.scheduleDraft.length === 0) {
            showCustomNotification('No schedule loaded to modify.', 'warning');
            return;
        }
        var dirty = getDirtySubjectsPatched();
        if (dirty.length === 0) {
            showCustomNotification('No changes to submit. Adjust at least one subject\'s day or time first.', 'warning');
            return;
        }
        ensureSlotFields(window.currentUser.data);
        if (getSlotsRemaining(window.currentUser.data) <= 0) {
            showCustomNotification('Slot limit reached. Ask the developer to reset your slots.', 'error');
            return;
        }

        var req = {
            id: 'REQ-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            studentId: window.currentUser.data.id,
            studentName: window.currentUser.data.name,
            defaultSchedule: deepClone(window.currentUser.data.defaultSchedule || []),
            modifiedSchedule: deepClone(window.scheduleDraft),
            changes: dirty,
            submittedAt: new Date().toISOString(),
            status: 'pending',
            reviewedAt: null,
            reviewedBy: null
        };
        if (!window.usersDB.scheduleChangeRequests) window.usersDB.scheduleChangeRequests = [];
        window.usersDB.scheduleChangeRequests.push(req);

        window.currentUser.data.modifiedSchedule = deepClone(window.scheduleDraft);
        window.currentUser.data.modificationStatus = 'pending';
        window.currentUser.data.scheduleChangesUsed = (window.currentUser.data.scheduleChangesUsed || 0) + 1;
        persistCurrentStudent();

        customConsoleLog('Schedule change request submitted (' + dirty.length + ' edits)', 'success');
        showCustomNotification('Change(s) submitted for admin approval.', 'success');
        if (typeof updatePendingRequestsBadge === 'function') updatePendingRequestsBadge();
        showFloatingNotification('📅 Schedule Modification Submitted!', 'Your schedule changes have been sent to the admin for approval. You will be notified once approved.', 'info');
        
        // Show sched-gen completion popup
        var sgPopup = document.getElementById('schedGenCompletionPopup');
        if (sgPopup) sgPopup.style.display = 'flex';
    }

    function resetScheduleDraftToDefault() {
        if (!window.currentUser || !window.currentUser.data || !window.currentUser.data.defaultSchedule) {
            showCustomNotification('No default schedule to reset to.', 'warning');
            return;
        }
        window.scheduleDraft = deepClone(window.currentUser.data.defaultSchedule);
        renderScheduleTable(window.scheduleDraft, 'scheduleResult');
        renderSubjectScheduleEditorPatched();
        showCustomNotification('Schedule reset to default.', 'info');
    }

    function getPendingRequestCount() {
        return (window.usersDB.scheduleChangeRequests || []).filter(function(r) { return r.status === 'pending'; }).length;
    }

    function updatePendingRequestsBadge() {
        var badge = document.getElementById('pendingRequestsBadge');
        if (!badge) return;
        var count = getPendingRequestCount();
        if (count > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = count;
        } else {
            badge.style.display = 'none';
        }
    }

    function renderRequestsPanel() {
        var container = document.getElementById('requestsList');
        if (!container) return;
        var pending = (window.usersDB.scheduleChangeRequests || []).filter(function(r) { return r.status === 'pending'; });
        if (pending.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No pending schedule change requests.</p></div>';
            updatePendingRequestsBadge();
            return;
        }
        var html = '';
        pending.forEach(function(req) {
            var submitted = new Date(req.submittedAt).toLocaleString();
            var changeLines = (req.changes || []).map(function(c) {
                return '<div class="request-change-line"><strong>' + escapeHtml(c.name) + '</strong> <span class="old">' + escapeHtml(c.from) + '</span> → <span class="new">' + escapeHtml(c.to) + '</span></div>';
            }).join('');
            html += '<div class="request-card" data-req-id="' + req.id + '">' +
                '<div class="request-card-header"><div><strong>' + escapeHtml(req.studentName || req.studentId) + '</strong><br><small>' + escapeHtml(req.studentId) + ' • ' + (req.changes.length + ' change(s)') + '</small></div><small>' + submitted + '</small></div>' +
                '<div class="request-changes">' + (changeLines || '<small style="color:#888;">No diff recorded.</small>') + '</div>' +
                '<div class="request-actions"><button class="reject-btn" data-action="reject" data-req-id="' + req.id + '"><i class="fas fa-xmark"></i> Reject</button>' +
                '<button class="approve-btn" data-action="approve" data-req-id="' + req.id + '"><i class="fas fa-check"></i> Approve</button></div></div>';
        });
        container.innerHTML = html;

        container.querySelectorAll('.approve-btn, .reject-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var reqId = this.getAttribute('data-req-id');
                var action = this.getAttribute('data-action');
                handleRequestDecision(reqId, action);
            });
        });
        updatePendingRequestsBadge();
    }

    function handleRequestDecision(requestId, action) {
        var req = (window.usersDB.scheduleChangeRequests || []).find(function(r) { return r.id === requestId; });
        if (!req) return;
        var student = window.usersDB.students.find(function(s) { return s.id === req.studentId; });
        if (!student) { showCustomNotification('Student not found for this request.', 'error'); return; }
        if (action === 'approve') {
            student.enrolledSubjects = deepClone(req.modifiedSchedule);
            student.defaultSchedule = deepClone(req.modifiedSchedule);
            student.modifiedSchedule = null;
            student.modificationStatus = 'approved';
            req.status = 'approved';
            customConsoleLog('Approved request for ' + student.name, 'success');
            showCustomNotification('Approved schedule change for ' + student.name + '.', 'success');
        } else if (action === 'reject') {
            student.modifiedSchedule = null;
            student.modificationStatus = 'rejected';
            req.status = 'rejected';
            customConsoleLog('Rejected request for ' + student.name, 'warning');
            showCustomNotification('Rejected schedule change for ' + student.name + '.', 'info');
        }
        req.reviewedAt = new Date().toISOString();
        req.reviewedBy = window.currentUser?.data?.email || 'admin';

        if (window.currentUser?.type === 'student' && window.currentUser.data.id === student.id) {
            window.currentUser.data = student;
        }
        saveData();
        renderRequestsPanel();
    }

    function updateEnrollmentSummary() {
        var bar = document.getElementById('enrollmentSummaryBar');
        if (!bar) return;
        var cards = document.querySelectorAll('#availableSubjectsList .subject-card');
        var anyCardsExist = cards.length > 0;
        bar.style.display = anyCardsExist ? 'flex' : 'none';

        var ticked = [];
        cards.forEach(function(card) {
            var cb = card.querySelector('.subject-checkbox');
            if (cb && cb.checked) {
                var idx = parseInt(card.getAttribute('data-subject-index'), 10);
                if (!isNaN(idx) && window.pendingEnrollment && window.pendingEnrollment.subjects[idx]) {
                    ticked.push(window.pendingEnrollment.subjects[idx]);
                }
            }
        });

        var countEl = document.getElementById('summarySelectedCount');
        var unitsEl = document.getElementById('summaryTotalUnits');
        if (countEl) countEl.textContent = ticked.length;
        var totalUnits = ticked.reduce(function(sum, s) {
            var u = parseInt(s.units, 10);
            return sum + (isNaN(u) ? 0 : u);
        }, 0);
        if (unitsEl) unitsEl.textContent = totalUnits;

        var clashes = detectClashes(ticked);
        var clashBox = document.getElementById('summaryClashBox');
        var clashText = document.getElementById('summaryClashText');
        if (clashBox && clashText) {
            if (clashes.length === 0) {
                clashBox.style.display = 'none';
                clashBox.classList.remove('clash-active');
            } else {
                clashBox.style.display = 'flex';
                clashBox.classList.add('clash-active');
                var first = clashes[0];
                var more = clashes.length > 1 ? ' (and ' + (clashes.length - 1) + ' more)' : '';
                clashText.innerHTML = '<strong>SCHEDULE CLASH:</strong> ' + escapeHtml(first.names.join(' ↔ ')) +
                    ' overlap on <strong>' + escapeHtml(first.day) + ' ' + escapeHtml(first.time) + '</strong>' + escapeHtml(more) + '. Untick one to resolve.';
            }
        }

        var clashKeys = {};
        clashes.forEach(function(c) {
            c.names.forEach(function(n) { clashKeys[n] = true; });
        });
        cards.forEach(function(card) {
            var cb = card.querySelector('.subject-checkbox');
            if (!cb) return;
            var name = cb.value;
            if (cb.checked && clashKeys[name]) card.classList.add('clash-flag');
            else card.classList.remove('clash-flag');
        });
        
        // Update button states
        if (typeof window.updateEnrollmentButtonsState === 'function') {
            window.updateEnrollmentButtonsState();
        }
    }

    function openConfirmEnrollmentModal() {
        var ticked = [];
        var unticked = [];
        var cards = document.querySelectorAll('#availableSubjectsList .subject-card');
        cards.forEach(function(card) {
            var cb = card.querySelector('.subject-checkbox');
            if (!cb) return;
            var idx = parseInt(card.getAttribute('data-subject-index'), 10);
            if (!isNaN(idx) && window.pendingEnrollment && window.pendingEnrollment.subjects[idx]) {
                if (cb.checked) ticked.push(window.pendingEnrollment.subjects[idx]);
                else unticked.push(window.pendingEnrollment.subjects[idx]);
            }
        });

        var modal = document.getElementById('confirmEnrollmentModal');
        var body = document.getElementById('confirmEnrollmentBody');
        if (!modal || !body) { if (typeof confirmSchedule === 'function') confirmSchedule(); return; }
        if (ticked.length === 0) { showCustomNotification('Please select at least one subject to enroll.', 'warning'); return; }

        var totalUnits = ticked.reduce(function(sum, s) {
            var u = parseInt(s.units, 10);
            return sum + (isNaN(u) ? 0 : u);
        }, 0);
        var clashes = detectClashes(ticked);
        
        if (clashes.length > 0) {
            showCustomNotification('❌ Cannot confirm enrollment: ' + clashes.length + ' schedule conflict(s) detected. Please resolve conflicts first.', 'error');
            modal.style.display = 'none';
            return;
        }
        
        var termType = document.getElementById('academicTermSelect')?.value || 'Semester';
        var termPeriod = document.getElementById('termPeriodSelect')?.value || '1st Semester';

        var enrollList = ticked.map(function(s) {
            return '<li><strong>' + escapeHtml(s.name) + '</strong> <small>(' + (s.units || 0) + ' units · ' + escapeHtml(s.schedule || 'TBD') + ')</small></li>';
        }).join('');

        body.innerHTML = '<div class="confirm-modal-summary">' +
            '<div class="confirm-stat"><span class="num">' + ticked.length + '</span><small>Subjects</small></div>' +
            '<div class="confirm-stat"><span class="num">' + totalUnits + '</span><small>Total Units</small></div>' +
            '<div class="confirm-stat"><span class="num">0</span><small>Clash(es)</small></div>' +
            '<div class="confirm-stat"><span class="num">' + unticked.length + '</span><small>To Defer</small></div>' +
            '</div>' +
            '<h4 style="margin:16px 0 6px;">Subjects you will enroll in:</h4>' +
            '<ul class="confirm-modal-enroll-list">' + enrollList + '</ul>' +
            '<div class="confirm-modal-actions">' +
            '<button type="button" class="modify-btn" id="confirmEnrollmentCancelBtn">Back</button>' +
            '<button type="button" class="confirm-btn" id="confirmEnrollmentProceedBtn"><i class="fas fa-check"></i> Confirm Enrollment</button>' +
            '</div>';

        modal.style.display = 'flex';

        var cancel = document.getElementById('confirmEnrollmentCancelBtn');
        var proceed = document.getElementById('confirmEnrollmentProceedBtn');
        if (cancel) cancel.onclick = function() { modal.style.display = 'none'; };
        if (proceed) proceed.onclick = function() {
            modal.style.display = 'none';
            if (typeof confirmSchedule === 'function') confirmSchedule();
        };
    }

    // Admin audience block functions
    function populateAudienceDropdowns() {
        var sectionSel = document.getElementById('audienceSectionSelect');
        var studentSel = document.getElementById('audienceStudentSelect');
        if (sectionSel) {
            var sections = Object.keys(window.usersDB.sectionAssignments || {}).sort();
            sectionSel.innerHTML = '<option value="">— Select section —</option>' +
                sections.map(function(id) {
                    var count = (window.usersDB.sectionAssignments[id] || []).length;
                    return '<option value="' + escapeHtml(id) + '">' + escapeHtml(id) + ' (' + count + ' student' + (count === 1 ? '' : 's') + ')</option>';
                }).join('');
        }
        if (studentSel) {
            var enrolled = (window.usersDB.students || []).filter(function(s) {
                return s.level && s.enrolledSubjects?.length > 0;
            });
            studentSel.innerHTML = '<option value="">— Select student —</option>' +
                enrolled.map(function(s) {
                    return '<option value="' + escapeHtml(s.id) + '">' + escapeHtml(s.name) + ' (' + escapeHtml(s.id) + ')' + (s.section ? ' — ' + escapeHtml(s.section) : '') + '</option>';
                }).join('');
        }
    }

    function refreshAudienceSummary() {
        var summary = document.getElementById('audienceSummary');
        if (!summary) return;
        var type = document.getElementById('audienceType')?.value || 'all';
        if (type === 'all') {
            summary.innerHTML = '<i class="fas fa-info-circle"></i> Will be sent to <strong>all enrolled students</strong>.';
        } else if (type === 'section') {
            var sec = document.getElementById('audienceSectionSelect')?.value;
            if (!sec) {
                summary.innerHTML = '<i class="fas fa-circle-exclamation"></i> Pick a section above to continue.';
            } else {
                var members = (window.usersDB.sectionAssignments?.[sec] || []).length;
                summary.innerHTML = '<i class="fas fa-info-circle"></i> Will be sent to section <strong>' + escapeHtml(sec) + '</strong> (' + members + ' student' + (members === 1 ? '' : 's') + ').';
            }
        } else if (type === 'student') {
            var sid = document.getElementById('audienceStudentSelect')?.value;
            if (!sid) {
                summary.innerHTML = '<i class="fas fa-circle-exclamation"></i> Pick a student above to continue.';
            } else {
                var who = window.usersDB.students.find(function(s) { return s.id === sid; });
                summary.innerHTML = '<i class="fas fa-info-circle"></i> Will be sent only to <strong>' + escapeHtml(who ? who.name : sid) + '</strong>.';
            }
        }
    }

    function getCurrentAudienceSelection() {
        var type = document.getElementById('audienceType')?.value || 'all';
        var out = { type: type };
        if (type === 'section') out.sectionId = document.getElementById('audienceSectionSelect')?.value || null;
        if (type === 'student') out.studentId = document.getElementById('audienceStudentSelect')?.value || null;
        return out;
    }

    // Override addNotification to include audience
    var originalAddNotification = window.addNotification;
    window.addNotification = function(type, title, details, reason) {
        var audience = getCurrentAudienceSelection();
        if (audience.type === 'section' && !audience.sectionId) {
            showCustomNotification('Please pick a section in the audience block first.', 'warning');
            return;
        }
        if (audience.type === 'student' && !audience.studentId) {
            showCustomNotification('Please pick a student in the audience block first.', 'warning');
            return;
        }
        if (typeof originalAddNotification === 'function') {
            originalAddNotification(type, title, details, reason);
        }
        var notifDB = window.notificationsDB;
        if (notifDB && notifDB[type] && notifDB[type][0]) {
            notifDB[type][0].audience = audience;
            saveNotifications();
        }
        showCustomNotification('Sent to ' + (audience.type === 'all' ? 'all students' : audience.type === 'section' ? 'section ' + audience.sectionId : 'selected student'), 'info');
    };

    // Filter notifications view by audience
    var originalLoadNotificationsView = window.loadNotificationsView;
    window.loadNotificationsView = function() {
        var u = window.currentUser;
        if (!u || u.type !== 'student') {
            if (typeof originalLoadNotificationsView === 'function') originalLoadNotificationsView();
            return;
        }
        var container = document.getElementById('studentNotificationsList');
        if (!container) return;
        var notifDB = window.notificationsDB;
        if (!notifDB) {
            if (typeof originalLoadNotificationsView === 'function') originalLoadNotificationsView();
            return;
        }
        var all = [];
        ['schedule', 'room', 'professor'].forEach(function(kind) {
            (notifDB[kind] || []).forEach(function(n) { all.push(Object.assign({}, n, { type: kind })); });
        });
        all.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
        
        // Filter by audience
        all = all.filter(function(n) {
            var a = n.audience;
            if (!a || a.type === 'all') return true;
            if (a.type === 'student') return a.studentId === u.data.id;
            if (a.type === 'section') return a.sectionId && u.data.section === a.sectionId;
            return true;
        });

        var headerHtml = '<div class="notifications-header">' +
            '<h3><i class="fas fa-bell"></i> Announcements & Updates</h3>' +
            '<div class="notifications-actions">' +
            '<button class="clear-all-btn" onclick="clearNotifications()"><i class="fas fa-trash-alt"></i> Clear All</button>' +
            '</div></div>';

        if (all.length === 0) {
            container.innerHTML = headerHtml + '<div class="empty-state"><i class="fas fa-bell-slash"></i><p>No announcements addressed to you right now.</p><small>Check back later for updates</small></div>';
            return;
        }
        var html = headerHtml + '<div class="notifications-color-grid">';
        all.forEach(function(n) {
            var icon = n.type === 'schedule' ? 'fa-calendar-alt' : (n.type === 'room' ? 'fa-door-open' : 'fa-chalkboard-teacher');
            var typeName = n.type === 'schedule' ? 'Schedule Change' : (n.type === 'room' ? 'Room Change' : 'Professor Change');
            var cardClass = n.type === 'schedule' ? 'notification-card-yellow' : (n.type === 'room' ? 'notification-card-blue' : 'notification-card-orange');
            var date = new Date(n.date);
            var formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            var formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            html += '<div class="notification-card ' + cardClass + '" data-id="' + n.id + '" data-type="' + n.type + '">' +
                '<div class="notification-card-header">' +
                '<div class="notification-icon-circle"><i class="fas ' + icon + '"></i></div>' +
                '<div class="notification-card-actions">' +
                '<span class="notification-type-badge">' + typeName + '</span>' +
                '<button class="delete-notification-btn" onclick="deleteNotification(' + n.id + ', \'' + n.type + '\')" title="Delete this announcement"><i class="fas fa-times"></i></button>' +
                '</div></div>' +
                '<div class="notification-card-title">' + escapeHtml(n.title) + '</div>' +
                '<div class="notification-card-details">' + escapeHtml(n.details || 'No additional details') + '</div>' +
                '<div class="notification-card-reason"><i class="fas fa-quote-left"></i> ' + escapeHtml(n.reason || 'No reason provided') + '</div>' +
                '<div class="notification-card-footer"><i class="fas fa-calendar-alt"></i> ' + formattedDate + ' at ' + formattedTime + '</div>' +
                '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
    };

    // Initialize all patches
    function initPatches() {
        window.renderSubjectScheduleEditor = renderSubjectScheduleEditorPatched;
        window.getDirtySubjects = getDirtySubjectsPatched;
        window.submitScheduleChangeRequest = submitScheduleChangeRequest;
        window.resetScheduleDraftToDefault = resetScheduleDraftToDefault;
        window.renderRequestsPanel = renderRequestsPanel;
        window.updatePendingRequestsBadge = updatePendingRequestsBadge;

        // Enrollment summary on checkbox change
        document.addEventListener('change', function(e) {
            if (e.target && e.target.classList && e.target.classList.contains('subject-checkbox')) {
                setTimeout(updateEnrollmentSummary, 10);
            }
        }, true);

        // Override confirm button
        whenReady(function() {
            var confirmBtn = document.getElementById('confirmScheduleBtn');
            if (confirmBtn) {
                var newConfirmBtn = confirmBtn.cloneNode(true);
                confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
                newConfirmBtn.addEventListener('click', openConfirmEnrollmentModal);
            }
            
            // Also ensure modify button works
            var modifyBtn = document.getElementById('modifyScheduleBtn');
            if (modifyBtn) {
                var newModifyBtn = modifyBtn.cloneNode(true);
                modifyBtn.parentNode.replaceChild(newModifyBtn, modifyBtn);
                newModifyBtn.addEventListener('click', function() {
                    if (typeof window.modifySchedule === 'function') {
                        window.modifySchedule();
                    }
                });
            }

            var submitBtn = document.getElementById('submitScheduleChangeBtn');
            if (submitBtn) {
                var newSubmitBtn = submitBtn.cloneNode(true);
                submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
                newSubmitBtn.addEventListener('click', submitScheduleChangeRequest);
            }

            var resetBtn = document.getElementById('resetScheduleBtn');
            if (resetBtn) {
                var newResetBtn = resetBtn.cloneNode(true);
                resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
                newResetBtn.addEventListener('click', resetScheduleDraftToDefault);
            }

            // Setup audience block
            var typeSel = document.getElementById('audienceType');
            var secSel = document.getElementById('audienceSectionSelect');
            var stuSel = document.getElementById('audienceStudentSelect');
            if (typeSel) {
                typeSel.addEventListener('change', function() {
                    var v = this.value;
                    document.getElementById('audienceSectionWrap').style.display = v === 'section' ? 'block' : 'none';
                    document.getElementById('audienceStudentWrap').style.display = v === 'student' ? 'block' : 'none';
                    refreshAudienceSummary();
                    if (v === 'section') populateAudienceDropdowns();
                    if (v === 'student') populateAudienceDropdowns();
                });
            }
            if (secSel) secSel.addEventListener('change', refreshAudienceSummary);
            if (stuSel) stuSel.addEventListener('change', refreshAudienceSummary);
            
            // Initialize section assignments
            if (!window.usersDB.sectionAssignments) window.usersDB.sectionAssignments = {};
        });
    }

    // ============================================================
    // Enhancement 2: Bulk Attendance Recording
    // ============================================================

    function initAttendancePeriodSelector() {
        var periodType = document.getElementById('attendancePeriodType');
        if (!periodType) return;

        function updatePeriodGroups() {
            var val = periodType.value;
            var weekGroup = document.getElementById('weekSelectGroup');
            var monthGroup = document.getElementById('monthSelectGroup');
            var info = document.getElementById('attendancePeriodInfo');

            if (weekGroup) weekGroup.style.display = val === 'weeks' ? '' : 'none';
            if (monthGroup) monthGroup.style.display = val === 'months' ? '' : 'none';

            if (info) {
                if (val === 'days') {
                    info.innerHTML = '<small><i class="fas fa-info-circle"></i> Enter the number of days to <strong>add</strong> to the cumulative attendance record for the selected subject and term.</small>';
                } else if (val === 'weeks') {
                    info.innerHTML = '<small><i class="fas fa-info-circle"></i> Recording attendance for the selected <strong>week</strong>. Values are added to the running term total.</small>';
                } else if (val === 'months') {
                    info.innerHTML = '<small><i class="fas fa-info-circle"></i> Recording attendance for the selected <strong>month</strong>. Values are added to the running term total.</small>';
                }
            }
        }

        periodType.addEventListener('change', updatePeriodGroups);
        updatePeriodGroups();
    }

    function saveBulkAttendance() {
        var studentId = document.getElementById('adminStudentSelect') && document.getElementById('adminStudentSelect').value;
        var subject = document.getElementById('gradeSubjectSelect') && document.getElementById('gradeSubjectSelect').value;
        var selectedTerm = (document.getElementById('adminTermSelect') && document.getElementById('adminTermSelect').value) || '1st Semester';
        var periodType = document.getElementById('attendancePeriodType') && document.getElementById('attendancePeriodType').value;

        if (!studentId) { showCustomNotification('Please select a student first', 'warning'); return; }
        if (!subject) { showCustomNotification('Please select a subject first', 'warning'); return; }

        var daysPresent = parseInt(document.getElementById('bulkDaysPresent') && document.getElementById('bulkDaysPresent').value, 10) || 0;
        var daysAbsent = parseInt(document.getElementById('bulkDaysAbsent') && document.getElementById('bulkDaysAbsent').value, 10) || 0;
        var daysTardy = parseInt(document.getElementById('bulkDaysTardy') && document.getElementById('bulkDaysTardy').value, 10) || 0;

        if (daysPresent === 0 && daysAbsent === 0 && daysTardy === 0) {
            showCustomNotification('Enter at least one attendance value to record', 'warning');
            return;
        }

        var student = window.usersDB.students.find(function(s) { return s.id === studentId; });
        if (!student) { showCustomNotification('Student not found', 'error'); return; }

        if (!student.attendanceHistory) student.attendanceHistory = {};
        if (!student.attendanceHistory[selectedTerm]) student.attendanceHistory[selectedTerm] = {};
        if (!student.attendanceHistory[selectedTerm][subject]) {
            student.attendanceHistory[selectedTerm][subject] = { present: 0, absent: 0, tardy: 0 };
        }

        var record = student.attendanceHistory[selectedTerm][subject];

        var periodLabel = '';
        if (periodType === 'weeks') {
            var weekVal = (document.getElementById('attendanceWeekSelect') && document.getElementById('attendanceWeekSelect').value) || 'Week 1';
            periodLabel = weekVal;
        } else if (periodType === 'months') {
            var monthVal = (document.getElementById('attendanceMonthSelect') && document.getElementById('attendanceMonthSelect').value) || 'August';
            periodLabel = monthVal;
        } else {
            periodLabel = daysPresent + daysAbsent + daysTardy + ' specific day(s)';
        }

        record.present = (record.present || 0) + daysPresent;
        record.absent  = (record.absent  || 0) + daysAbsent;
        record.tardy   = (record.tardy   || 0) + daysTardy;

        if (typeof saveData === 'function') saveData();

        var msg = 'Attendance recorded for ' + student.name + ' — ' + subject + ' (' + selectedTerm + ' / ' + periodLabel + '): ';
        msg += daysPresent + ' present, ' + daysAbsent + ' absent, ' + daysTardy + ' tardy';
        if (typeof customConsoleLog === 'function') customConsoleLog(msg, 'success');
        if (typeof showCustomNotification === 'function') showCustomNotification('Attendance saved successfully!', 'success');

        document.getElementById('bulkDaysPresent').value = 0;
        document.getElementById('bulkDaysAbsent').value  = 0;
        document.getElementById('bulkDaysTardy').value   = 0;

        var currentAttendanceDisplay = document.getElementById('currentAttendanceDisplay');
        if (currentAttendanceDisplay) {
            currentAttendanceDisplay.innerHTML =
                'Current Attendance: ' +
                '<span class="attendance-present">Present: ' + record.present + '</span> | ' +
                '<span class="attendance-absent">Absent: '  + record.absent  + '</span> | ' +
                '<span class="attendance-tardy">Tardy: '   + record.tardy   + '</span>';
        }
    }

    // ============================================================
    // Completion Overlay — shown when user revisits a finished step
    // ============================================================
    function showCompletionOverlay(title, message, type) {
        var existing = document.getElementById('completionOverlay');
        if (existing) existing.remove();

        var icons   = { enrollment: 'fa-graduation-cap', schedule: 'fa-calendar-check' };
        var colors  = { enrollment: '#10B981',            schedule: '#3B82F6' };
        var icon    = icons[type]  || 'fa-check-circle';
        var color   = colors[type] || '#10B981';
        var lightBg = type === 'enrollment' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)';

        var overlay = document.createElement('div');
        overlay.id = 'completionOverlay';
        overlay.className = 'completion-overlay';
        overlay.innerHTML =
            '<div class="completion-card">' +
                '<div class="completion-icon-ring" style="background:' + lightBg + ';border:3px solid ' + color + ';">' +
                    '<i class="fas ' + icon + '" style="color:' + color + ';"></i>' +
                '</div>' +
                '<div class="completion-sparkles"><i class="fas fa-sparkles" style="color:#FFB347;"></i></div>' +
                '<h2 class="completion-title">' + escapeHtml(title) + '</h2>' +
                '<p class="completion-message">' + escapeHtml(message) + '</p>' +
                '<div class="completion-actions">' +
                    '<button class="completion-btn-secondary" id="completionProceedBtn">' +
                        '<i class="fas fa-arrow-right"></i> Proceed Anyway' +
                    '</button>' +
                    '<button class="completion-btn-primary" id="completionDashboardBtn" style="background:' + color + ';">' +
                        '<i class="fas fa-house"></i> Go to Dashboard' +
                    '</button>' +
                '</div>' +
            '</div>';

        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
        overlay.querySelector('#completionProceedBtn').addEventListener('click', function() { overlay.remove(); });
        overlay.querySelector('#completionDashboardBtn').addEventListener('click', function() {
            overlay.remove();
            if (typeof switchContent === 'function') switchContent('dashboard');
        });

        document.body.appendChild(overlay);
        requestAnimationFrame(function() { overlay.classList.add('visible'); });
    }

    window.showCompletionOverlay = showCompletionOverlay;

    window.saveBulkAttendance = saveBulkAttendance;
    window.initAttendancePeriodSelector = initAttendancePeriodSelector;

    // Wire up bulk attendance UI after DOM is ready
    whenReady(function() {
        initAttendancePeriodSelector();
        var saveBtn = document.getElementById('saveBulkAttendanceBtn');
        if (saveBtn) saveBtn.addEventListener('click', saveBulkAttendance);
    });

    initPatches();
    console.log('[Patches Module] Loaded');
})();