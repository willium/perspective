/******************************************************************************
 *
 * Copyright (c) 2019, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

const {WebSocketHost, table} = require("@finos/perspective/build/perspective.node.js");

// Start a WS/HTTP host on port 8080.  The `assets` property allows
// the `WorkerHost()` to also serves the file structure rooted in this
// module's directory.
const host = new WebSocketHost({assets: [__dirname], port: 8080});

// Generate new data for load and update
const SECURITIES = ["AAPL.N", "AMZN.N", "QQQ.N", "NVDA.N", "TSLA.N", "FB.N", "MSFT.N", "TLT.N", "XIV.N", "YY.N", "CSCO.N", "GOOGL.N", "PCLN.N"];

const CLIENTS = ["Homer", "Marge", "Bart", "Lisa", "Maggie", "Moe", "Lenny", "Carl", "Krusty"];

function newRows() {
    var rows = [];
    for (var x = 0; x < 5; x++) {
        rows.push({
            name: SECURITIES[Math.floor(Math.random() * SECURITIES.length)],
            client: CLIENTS[Math.floor(Math.random() * CLIENTS.length)],
            lastUpdate: new Date(),
            chg: Math.random() * 20 - 10,
            bid: Math.random() * 10 + 90,
            ask: Math.random() * 10 + 100,
            vol: Math.random() * 10 + 100
        });
    }
    return rows;
}

// Read an arrow file from the file system and load it as a named table.
const tbl = table(newRows(), {
    limit: 500
});
host.host_table("table_one", tbl);
const view = tbl.view();
host.host_view("view_one", view);

// Update with new rows every 500 ms
(function postRow() {
    tbl.update(newRows());
    setTimeout(postRow, 2500);
})();
