#!/usr/bin/env node
'use strict';

const as = require('activitystrea.ms');
const app = require('commander');
const path = require('path');
const fs = require('fs');
const through = require('through2');
const pointer = require('json-pointer');
const AS2Stream = as.Stream;

function collect(val, memo) {
  memo.push(val);
  return memo;
}

app.version('0.0.1')
   .description('Activity Streams 2.0 Document Inspector')
   .option('-i, --input <path>', 'Path of the document to inspect')
   .option('-p, --ptr <pointer>', 'A JSON Pointer to query')
   .parse(process.argv);

if (!app.input || !app.ptr) {
  app.outputHelp();
  process.exit(1);
}

const input = path.resolve(process.cwd(), app.input);

const read = fs.createReadStream(input);
read.on('error', (err)=>{
  console.error(`Cannot read input file [${err.message}]`);
  process.exit(1);
});

read.pipe(new AS2Stream())
    .pipe(through.obj((obj, encoding, callback)=>{
       obj.export((err, obj)=> {
         if (err) {
           console.log(`Could not serialize the input [${err.message}]`);
           process.exit(1);
         }
         if (pointer.has(obj, app.ptr))
           console.log(pointer.get(obj, app.ptr));
         else
           console.log('(undefined)');
       });
    }));
