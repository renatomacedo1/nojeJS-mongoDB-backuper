const { spawn, exec } = require("child_process");
const path = require("path");
const cron = require("node-cron");

var file_system = require("fs");
var archiver = require("archiver");

var output = file_system.createWriteStream("backup.zip");
var archive = archiver("zip");

var zipper = require("zip-local");

/* 
Basic mongo dump and restore commands, they contain more options you can have a look at man page for both of them.
1. mongodump --db=GANTT --archive=./gantt.gzip --gzip
2. mongorestore --db=GANTT --archive=./gantt.gzip --gzip
Using mongodump - without any args:
  will dump each and every db into a folder called "dump" in the directory from where it was executed.
Using mongorestore - without any args:
  will try to restore every database from "dump" folder in current directory, if "dump" folder does not exist then it will simply fail.
*/

const DB_NAME = process.env.MONGO_DB;
const DB_NAME2 = process.env.MONGO_DB2;
const dir = "GANTT";
/* const ARCHIVE_PATH = path.join(__dirname, "public", `${dir}.gzip`); */
const ARCHIVE_PATH = "backup/";

// 1. Cron expression for every 5 seconds - */5 * * * * *
// 2. Cron expression for every night at 00:00 hours (0 0 * * * )
// Note: 2nd expression only contains 5 fields, since seconds is not necessary

// Scheduling the backup every 5 seconds (using node-cron)
cron.schedule("*/10 * * * * *", () => backupMongoDB());

function backupMongoDB() {
  /* const child = spawn('mongodump', [
    `--db=${DB_NAME}`,
    `--archive=${ARCHIVE_PATH}`,
    '--gzip',
  ]); */
  /* const child = spawn("mongodump", [
    `--uri=mongodb+srv://admin:outono123@cluster0.g4qfs.mongodb.net/GANTT`,
    `--archive=${ARCHIVE_PATH}`,
    "--gzip",
  ]); */

  const child = spawn("mongodump", [
    `--uri=mongodb+srv://admin:outono123@cluster0.g4qfs.mongodb.net/GANTT`,
    `-o${ARCHIVE_PATH}`,
  ]);

  child.stdout.on("data", (data) => {
    console.log("stdout:\n", data);
  });
  child.stderr.on("data", (data) => {
    console.log("stderr:\n", Buffer.from(data).toString());
  });
  child.on("error", (error) => {
    console.log("error:\n", error);
  });
  child.on("exit", (code, signal) => {
    if (code) console.log("Process exit with code:", code);
    else if (signal) console.log("Process killed with signal:", signal);
    else {
      console.log("Backup is successfull ✅");
      zipper.sync.zip("./backup/GANTT/").compress().save("backup.zip");
    }
  });
}
