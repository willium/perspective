/******************************************************************************
 *
 * Copyright (c) 2019, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

const {WebSocketHost, table} = require("@finos/perspective/build/perspective.node.js");
const fs = require("fs");

// Start a WS/HTTP host on port 8080.  The `assets` property allows
// the `WorkerHost()` to also serves the file structure rooted in this
// module's directory.
const host = new WebSocketHost({assets: [__dirname], port: 8080});

// Read an arrow file from the file system and load it as a named table.
const arr = fs.readFileSync(__dirname + "/test.arrow");
const tbl = table(arr);
host.host_table("table_one", tbl);

// Host a view, setting the `on_update` function to return updated rows
const view = tbl.view();
host.host_view("view_one", view);

// Given the updated rows, post them through the websocketd
(function postRow() {
    view.to_arrow().then(new_data => tbl.update(new_data));
    setTimeout(postRow, 500);
})();
