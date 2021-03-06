/**
 *  excel处理插件：
 *  读取示例：
 *    var obj = xlsx.parse(__dirname + '/myFile.xlsx'); // parses a file 
 
      var obj = xlsx.parse(fs.readFileSync(__dirname + '/myFile.xlsx')); // parses a buffer
 *
 *  写入示例
    data = [
        ['ID', '姓名', '性别', '年龄', '手机号', '日期'],
        [1, '张三丰', '男', 18, '1111111111', '2015-09-11'],
        [2, '大刀王五', null, 29, '13570321497', '2015-09-11 16:23'],
        [null, '尼玛']
    ];

    // 列宽设置
    colsWidth = [
        {wch: 8},
        {wch: 20},
        {wch: 30},
        {wch: 5},
        {wch: 6},
        {wch: 7}
    ]

    var fileBuffer = Excel.build([{name: '基本表', data: data, colsWidth: colsWidth}, {name: '基本表1', data: data}]);

    download(req, res, next, {
        buffer: fileBuffer,
        filename: '测试下载文件名.xlsx'
    });
 */

const XLSX = require('xlsx');

const lodash = {
  defaults: require('lodash.defaults'),
  map: require('lodash.map')
};

function datenum(v, date1904) {
  if (date1904) {
    v += 1462;
  }

  const epoch = Date.parse(v);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheetFromArrayOfArrays(data) {
  const ws = {};
  const range = {
    s: {
      c: 10000000,
      r: 10000000
    },
    e: {
      c: 0,
      r: 0
    }
  };

  for (let R = 0; R !== data.length; ++R) {
    for (let C = 0; C !== data[R].length; ++C) {
      if (range.s.r > R) {
        range.s.r = R;
      }
      if (range.s.c > C) {
        range.s.c = C;
      }
      if (range.e.r < R) {
        range.e.r = R;
      }
      if (range.e.c < C) {
        range.e.c = C;
      }

      let cell = {
        v: data[R][C]
      };

      if (cell.v === null) {
        continue;
      }

      const cellRef = XLSX.utils.encode_cell({
        c: C,
        r: R
      });

      if (typeof cell.v === 'number') {
        cell.t = 'n';
      } else if (typeof cell.v === 'boolean') {
        cell.t = 'b';
      } else if (cell.v instanceof Date) {
        cell.t = 'n';
        cell.z = XLSX.SSF._table[14];
        cell.v = datenum(cell.v);
      } else {
        cell.t = 's';
      }

      ws[cellRef] = cell;
    }
  }
  if (range.s.c < 10000000) {
    ws['!ref'] = XLSX.utils.encode_range(range);
  }

  return ws;
}

function Workbook() {
  if (!(this instanceof Workbook)) {
    return new Workbook();
  }
  this.SheetNames = [];
  this.Sheets = {};
}

module.exports = {
  parse: (mixed, options) => {
    let ws;
    if (typeof mixed === 'string') {
      ws = XLSX.readFile(mixed, options);
    } else {
      ws = XLSX.read(mixed, options);
    }
    return lodash.map(ws.Sheets, (sheet, name) => {
      return {
        name,
        data: XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          raw: true
        })
      };
    });
  },
  build: (array, options) => {
    const defaults = {
      bookType: 'xlsx',
      bookSST: false,
      type: 'binary'
    };
    const wb = new Workbook();

    array.forEach((worksheet) => {
      const name = worksheet.name || 'Sheet';
      const sheetData = sheetFromArrayOfArrays(worksheet.data || []);

      wb.SheetNames.push(name);
      wb.Sheets[name] = data;

      // 支持设置列宽
      if (worksheet['colsWidth']) {
        sheetData['!cols'] = worksheet['colsWidth'];
      }
    });

    const data = XLSX.write(wb, lodash.defaults(options || {}, defaults));
    if (!data) {
      return false;
    }
    // return new Buffer(data, 'binary');
    return Buffer.from(data, 'binary');
  }
};
