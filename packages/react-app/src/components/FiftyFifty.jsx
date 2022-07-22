import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { utils } from "ethers";
import { useContractReader } from "eth-hooks";

export default function FiftyFifty({ tx, readContracts, writeContracts, address }) {
  const location = window.location.pathname;
  const githubURL = `https://github.com${location}`;

  const splitAddress = useContractReader(readContracts, "YourContract", "getSplitAddress", [githubURL]);
  const exists = splitAddress !== "0x0000000000000000000000000000000000000000";
  const owner = useContractReader(readContracts, "YourContract", "owner");
  const splitAddressSection = !splitAddress ? (
    <></>
  ) : exists ? (
    <h3>
      <Button
        kind="primary"
        onClick={() => {
          window.open(`https://app.0xsplits.xyz/accounts/${splitAddress}`, "_blank");
        }}
        target="_blank"
      >{`Your split info is here`}</Button>
    </h3>
  ) : (
    <h4>Submit an Application to join!</h4>
  );
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
      <h3>
        <span style={{ marginRight: "2px" }}>
          <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" height="32px" />
        </span>
        <a href={githubURL} target="_blank">
          {githubURL}
        </a>
      </h3>
      {splitAddressSection}
    </div>
  );
  const airtableForm = (
    <iframe
      class="airtable-embed"
      src={`https://airtable.com/embed/shrWAzxamKToY2Dmv?backgroundColor=purple&prefill_GithubURL=${encodeURI(
        githubURL,
      )}&prefill_ReceiveMoneyAddress=${encodeURI(address || "")}`}
      frameborder="0"
      onmousewheel=""
      width="100%"
      height="100%"
      style={{ background: "transparent", border: "1px solid #ccc" }}
    ></iframe>
  );
  return exists ? (
    homeSection
  ) : (
    <div style={{ display: "flex", flexDirection: "row", width: "100vw", height: "100vh" }}>
      <div style={{ width: "50vw", height: "100vh" }}>{homeSection}</div>
      <div style={{ width: "50vw", height: "100vh" }}>{airtableForm}</div>
    </div>
  );
}
