var ganttChart = document.getElementById('ganttChart');
var colors = [
    '#F9F871',
    '#A3CFCD',
    '#FFE3F1',
    '#BFFCF9',
    '#D3FBD8',
    '#CF9EAC',
    '#B9AA87',
    '#CBCCFF',
];
var numColors = colors.length;
var numProcess = 0;
var initialNumProcess = 4;
function init() {
    for (var i = 0; i < initialNumProcess; i++) addRow();
}
function findHRR(arrivalTime, burstTime, n, visited, curTime) {
    var mx = -1;
    var ans = -1;
    for (var i = 0; i < n; i += 1) {
        if (!visited[i] && arrivalTime[i] <= curTime) {
            var waitingTimeYet = curTime - arrivalTime[i];
            var hrr = (waitingTimeYet + burstTime[i]) / burstTime[i];
            if (hrr > mx) {
                mx = hrr;
                ans = i;
            }
        }
    }
    return ans;
}

function HRRN(processes) {
    var burstTime = [];
    var arrivalTime = [];
    var finalSchedule = [];
    const n = processes.length;
    for (var i = 0; i < n; i += 1) {
        burstTime.push(processes[i].burstTime);
    }
    for (var i = 0; i < n; i += 1) {
        arrivalTime.push(processes[i].arrivalTime);
    }

    schedule = [];
    var curTime = 0;
    var done = 0;
    visited = [];
    for (var i = 0; i < n; i += 1) {
        visited.push(0);
    }
    while (done < n) {
        var process = findHRR(arrivalTime, burstTime, n, visited, curTime);
        // console.log(process);
        if (process != -1) {
            schedule.push({
                pId: processes[process].pId,
                start: curTime,
                end: curTime + burstTime[process],
            });
            done += 1;
            curTime += burstTime[process];
            visited[process] = 1;
        } else {
            schedule.push({
                pId: -1,
                start: curTime,
                end: curTime + 1,
            });
            curTime += 1;
        }
    }
    var ptr = 0;
    while (ptr < schedule.length) {
        if (schedule[ptr].pId != -1) {
            finalSchedule.push(schedule[ptr]);
            ptr += 1;
            continue;
        }
        var total = 0;
        var o = ptr;
        while (ptr < schedule.length && schedule[ptr].pId == -1) {
            total += 1;
            ptr++;
        }
        finalSchedule.push({
            pId: -1,
            start: schedule[o].start,
            end: schedule[o].start + total,
        });
    }
    return finalSchedule;
}

function compute() {
    if (!checkValues()) return;

    // initialising
    document.getElementById('ganttChart').innerHTML = '';
    var processes = [];

    // parsing the input
    var arrivalTimeArr = Array.from(
        document.getElementsByClassName('arrivalTime')
    ).map((entry) => parseFloat(entry.value));
    var burstTimeArr = Array.from(
        document.getElementsByClassName('burstTime')
    ).map((entry) => parseFloat(entry.value));

    var processes = arrivalTimeArr.map((entry, idx) => {
        return {
            pId: idx,
            arrivalTime: arrivalTimeArr[idx],
            burstTime: burstTimeArr[idx],
        };
    });

    //-------------------------------------Main Algorithm (input is array of 'processes')-----------------------------------------

    var slots = HRRN(processes);

    //----------------------------------------output will be array of 'slots'---------------------------------------------------

    var totalTime = slots.at(-1).end;
    for (var i = 0; i < slots.length; i += 1) {
        var pId = slots[i].pId;
        var start = slots[i].start;
        var end = slots[i].end;

        var curWidth = ((end - start) / (totalTime * 1.1)) * 100;
        if (pId == -1) {
            ganttChart.innerHTML +=
                '<div class="gantt_block" style="background-color: #B9B9B9' +
                '; width: ' +
                curWidth +
                '%;">' +
                'Bubble' +
                '<br/>' +
                start +
                ' - ' +
                end +
                '</div>';
            continue;
        }
        ganttChart.innerHTML +=
            '<div class="gantt_block" style="background-color: ' +
            colors[i % numColors] +
            '; width: ' +
            curWidth +
            '%;">P' +
            pId +
            '<br/>' +
            start +
            ' - ' +
            end +
            '</div>';

        var tat = end - arrivalTimeArr[pId];
        var wt = tat - burstTimeArr[pId];
        document.getElementById('P' + pId + '_TAT').innerText = tat;
        document.getElementById('P' + pId + '_WT').innerText = wt;
    }

    var totalTat = 0;
    Array.from(document.getElementsByClassName('TAT')).forEach(function (el) {
        totalTat += parseFloat(el.innerText);
    });
    document.getElementById('AVG_TAT').innerText = (
        totalTat / numProcess
    ).toFixed(2);
    var totalWt = 0;
    Array.from(document.getElementsByClassName('WT')).forEach(function (el) {
        totalWt += parseFloat(el.innerText);
    });
    // console.log(totalTat, totalWt, numProcess);
    document.getElementById('AVG_WT').innerText = (
        totalWt / numProcess
    ).toFixed(2);
}

function checkValues() {
    var flag = true;
    $('#errorMessage').empty();
    $('.arrivalTime').each(function (index) {
        if (
            $(this).val() == '' ||
            !$.isNumeric($(this).val()) ||
            parseFloat($(this).val()) < 0
        ) {
            $('#errorMessage').append(
                'Arrival Time for Process P' + index + ' is invalid <br/>'
            );
            flag = false;
        }
    });
    $('.burstTime').each(function (index) {
        // check if burst_time is filled out
        if (
            $(this).val() == '' ||
            !$.isNumeric($(this).val()) ||
            parseFloat($(this).val()) < 0
        ) {
            $('#errorMessage').append(
                'Arrival Time for Process P' + index + ' is invalid <br/>'
            );
            flag = false;
        }
    });

    return flag;
}
function addRow() {
    var tbody = document
        .getElementById('table')
        .getElementsByTagName('tbody')[0];
    var row = tbody.insertRow(numProcess);

    var cell0 = row.insertCell(-1);
    cell0.innerHTML = 'P' + numProcess;

    var cell1 = row.insertCell(-1);
    cell1.innerHTML =
        '<input type="text" class="arrivalTime" id =P' +
        numProcess +
        ' ' +
        'value=' +
        Math.floor(Math.random() * 20 + 1) +
        '>';

    var cell2 = row.insertCell(-1);
    cell2.innerHTML =
        '<input type="text" class="burstTime" id =P' +
        numProcess +
        ' ' +
        'value=' +
        Math.floor(Math.random() * 20 + 1) +
        '>';

    var cell3 = row.insertCell(-1);
    cell3.innerHTML =
        '<span id ="P' + numProcess + '_TAT" class = "TAT"></span>';

    var cell4 = row.insertCell(-1);
    cell4.innerHTML = '<span id ="P' + numProcess + '_WT" class = "WT"></span>';

    numProcess++;
}
function deleteRow() {
    document.getElementById('table').deleteRow(numProcess);
    numProcess--;
}

init();
