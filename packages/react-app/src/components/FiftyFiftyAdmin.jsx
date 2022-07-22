import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, List } from "antd";
import React, { useState, useEffect, useCallback } from "react";
import { utils } from "ethers";
import { useContractReader } from "eth-hooks";

export default function FiftyFiftyAdmin({ tx, readContracts, writeContracts, address }) {
  const location = window.location.pathname;
  const owner = useContractReader(readContracts, "YourContract", "owner");
  console.log(`Owner: ${owner}`);
  const isOwner = address === owner;
  const [projects, setProjects] = useState([]);
  const [deleted, setDeleted] = useState(0);
  useEffect(async () => {
    const data = await fetch("https://api.airtable.com/v0/appeFA58ZaGbZ31W2/Projects?api_key=keyiEf8fQaP7oZJEC").then(
      resp => resp.json(),
    );
    setProjects(data.records);
    console.log(data.records);
  }, [deleted]);

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
  const approve = useCallback(
    (item, approveOrDeny) => {
      const fields = item.fields;
      //      console.log(writeContracts);
      //console.log(fields.PercentAllocations.split("\n").map(i => Math.round(parseFloat(i) * 1e4)));
      //console.log(Math.round(parseFloat(fields.CommunityPoolPercentage) * 1e6));
      if (approveOrDeny) {
        const result = tx(
          writeContracts.YourContract.addProjectToSystem(
            fields.GithubURL,
            fields.ReceiveMoneyAddress,
            fields.SplitGithubURLs.split("\n"),
            fields.PercentAllocations.split("\n").map(i => Math.round(parseFloat(i) * 1e4)),
            Math.round(parseFloat(fields.CommunityPoolPercentage) * 1e6),
            fields.CommunityPoolAddress || fields.ReceiveMoneyAddress,
          ),
          update => {
            console.log("📡 Transaction Update:", update);
            if (update && (update.status === "confirmed" || update.status === 1)) {
              console.log(" 🍾 Transaction " + update.hash + " finished!");
              fetch(`https://api.airtable.com/v0/appeFA58ZaGbZ31W2/Projects/${item.id}?api_key=keyiEf8fQaP7oZJEC`, {
                method: "DELETE",
              }).then(() => {
                setDeleted(d => d + 1);
              });
            }
          },
        );
      } else {
        fetch(`https://api.airtable.com/v0/appeFA58ZaGbZ31W2/Projects/${item.id}?api_key=keyiEf8fQaP7oZJEC`, {
          method: "DELETE",
        }).then(() => {
          setDeleted(d => d + 1);
        });
      }
    },
    [tx, writeContracts],
  );
  return (
    <div style={{ display: "flex", flexDirection: "row", width: "100vw", height: "100vh" }}>
      <div style={{ width: "50vw", height: "100vh" }}>{homeSection}</div>
      <div style={{ width: "50vw", height: "100vh" }}>
        {projects.length == 0 && <h3>No open applications!</h3>}
        {projects.length > 0 && (
          <List
            dataSource={projects}
            renderItem={item => {
              console.log(item);
              const percents = item.fields.PercentAllocations.split("\n");
              const splitGithubs = item.fields.SplitGithubURLs.split("\n");
              return (
                <List.Item
                  actions={
                    isOwner
                      ? [
                          <Button
                            onClick={() => {
                              approve(item, true);
                            }}
                          >
                            Approve
                          </Button>,
                          <Button
                            onClick={() => {
                              approve(item, false);
                            }}
                          >
                            Deny
                          </Button>,
                        ]
                      : []
                  }
                >
                  <List.Item.Meta
                    title={item.fields.GithubURL}
                    description={`Address: ${item.fields.ReceiveMoneyAddress}`}
                  />
                  {percents.join(", ")} <br />
                  {splitGithubs.join(", ")}
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
