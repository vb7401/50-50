import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState, useEffect } from "react";
import { utils } from "ethers";
import { useContractReader } from "eth-hooks";

export default function FiftyFifty({ tx, readContracts, writeContracts, address }) {
  const location = window.location.pathname;
  const githubURL = `https://github.com${location}`;

  const projectInfo = useContractReader(readContracts, "YourContract", "getProject", [githubURL]);
  console.log(projectInfo);
  const splitAddress = projectInfo && projectInfo.splitProxyAddress;
  const splitGithubURLs = projectInfo && projectInfo.splitGithubURLs;
  const percentAllocations = projectInfo && projectInfo.percentAllocations;
  const receiveMoneyAddress = projectInfo && projectInfo.receiveMoneyAddress;
  const communityPoolAddress = projectInfo && projectInfo.communityPoolAddress;
  const communityPoolPercentage = projectInfo && projectInfo.communityPoolPercentage;

  const isInSystem = receiveMoneyAddress && receiveMoneyAddress !== "0x0000000000000000000000000000000000000000";

  const owner = useContractReader(readContracts, "YourContract", "owner");
  const splitAddressSection = !splitAddress ? (
    <></>
  ) : isInSystem ? (
    <>
      <h4>
        {`Team's 50% goes to `}
        <a href={`https://etherscan.io/address/${receiveMoneyAddress}`} target="_blank">
          {receiveMoneyAddress}
        </a>
      </h4>
      <h4>
        {`Community pool of ${communityPoolPercentage / 1e4}% goes to `}
        <a href={`https://etherscan.io/address/${communityPoolAddress}`} target="_blank">
          {communityPoolAddress}
        </a>
      </h4>
      {splitGithubURLs.map((githubURL, index) => (
        <h4>
          {`${percentAllocations[index] / 1e4}% goes to `}
          <a href={githubURL} target="_blank">
            {githubURL}
          </a>
        </h4>
      ))}
      <h4>
        <Button
          kind="primary"
          onClick={() => {
            window.open(`https://app.0xsplits.xyz/accounts/${splitAddress}`, "_blank");
          }}
          target="_blank"
        >{`Donate money here!`}</Button>
      </h4>
    </>
  ) : (
    <></>
  );
  const isOwner = address === owner;
  const homeSection = (
    <div
      style={{
        padding: 16,
        width: 600,
        margin: "auto",
        marginTop: 64,
        textAlign: "center",
      }}
    >
      <img src="https://0xparc.org/logo_with_text.fd13ff62.svg" height="200px" />
      <h1>
        <i>50-50</i>
      </h1>
      <h1>
        <span style={{ marginRight: "4px" }}>
          <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" height="32px" />
        </span>

        <a href={githubURL} target="_blank" style={{ color: isInSystem ? "green" : "red" }}>
          {githubURL}
        </a>
      </h1>
      {splitAddressSection}
    </div>
  );
  const airtableForm = (
    <iframe
      title="submit application"
      class="airtable-embed"
      src={`https://airtable.com/embed/shrWAzxamKToY2Dmv?backgroundColor=purple&prefill_GithubURL=${encodeURI(
        githubURL,
      )}&prefill_ReceiveMoneyAddress=${encodeURI(address || "")}&prefill_SplitGithubURLs=${encodeURI(
        "https://github.com/ORG1HERE\nhttps://github.com/ORG2HERE",
      )}&prefill_PercentAllocations=${encodeURI("30\n20")}&prefill_CommunityPoolPercentage=0`}
      onmousewheel=""
      width="100%"
      style={{ background: "white", border: "0px", position: "fixed", height: "calc(100vh - 400px)" }}
    ></iframe>
  );
  return isInSystem ? (
    homeSection
  ) : (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh" }}>
      <div style={{ width: "100vw", height: "400px" }}>{homeSection}</div>
      <div style={{ width: "100vw", height: "calc(100vh - 400px)" }}>{airtableForm}</div>
    </div>
  );
}
