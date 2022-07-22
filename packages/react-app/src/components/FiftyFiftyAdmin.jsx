import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { utils } from "ethers";
import { useContractReader } from "eth-hooks";

export default function FiftyFifty({ tx, readContracts, writeContracts, address }) {
  const location = window.location.pathname;
  const owner = useContractReader(readContracts, "YourContract", "_owner");

  const isOwner = address === owner;
  const homeSection = (
    <div
      style={{
        padding: 16,
        width: 400,
        margin: "auto",
        marginTop: 64,
        textAlign: "center",
      }}
    >
      <img src="https://0xparc.org/logo_with_text.fd13ff62.svg" height="200px" />
      <h1>
        <i>FiftyFifty</i>
      </h1>
      <h3>Admin Panel</h3>
      <h3>
        <span style={{ marginRight: "2px" }}>
          <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" height="32px" />
          {isOwner ? "You are the Admin" : "You are not the Admin"}
        </span>
      </h3>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "row", width: "100vw", height: "100vh" }}>
      <div style={{ width: "50vw", height: "100vh" }}>{homeSection}</div>
      <div style={{ width: "50vw", height: "100vh" }}></div>
    </div>
  );
}
