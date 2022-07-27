import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, List } from "antd";
import React, { useState, useEffect, useCallback } from "react";
import { utils } from "ethers";
import { useContractReader } from "eth-hooks";
import SplitTable from "./SplitTable";
import { Octokit } from "@octokit/core";

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

  const octokit = new Octokit({
    auth: "",
  });

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
        <i>50-50</i>
      </h1>
      <h3>Admin Panel</h3>
      <h3>
        <span style={{ marginRight: "2px" }}>{isOwner ? "You are the Admin" : "You are not the Admin"}</span>
      </h3>
    </div>
  );
  const notifyGithub = useCallback(async (admittedURL, splitGithubs) => {
    splitGithubs.forEach(async githubURL => {
      const secondHalf = githubURL.slice(githubURL.indexOf("github.com") + 11);
      const slashIndex = secondHalf.indexOf("/");
      if (slashIndex != -1) {
        const owner = secondHalf.slice(0, slashIndex);
        const repo = secondHalf.slice(slashIndex + 1);
        console.log(owner, repo);
        try {
          await octokit.request(`POST /repos/${owner}/${repo}/issues`, {
            owner: owner,
            repo: repo,
            title: "You've been added to a split in 0xPARC's 50-50!",
            body: `${admittedURL} has added you to a split in 0xPARC's 50-50 program. This means that everytime someone donates to them, some percentage will be sent to your repo.\n
            \n
            You can claim these funds at https://5050split.xyz/${owner}/${repo}\n
            \n
            More information available at https://5050split.xyz!`,
          });
        } catch (e) {
          console.log(e);
        }
      }
    });
  }, []);
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
    <div style={{ display: "flex", flexDirection: "column", width: "600px", margin: "auto" }}>
      <div style={{ width: "100%" }}>{homeSection}</div>
      <div style={{ width: "100%" }}>
        {projects.length == 0 && <h3 style={{ textAlign: "center", color: "red" }}>No open applications!</h3>}
        {projects.length > 0 && (
          <List
            dataSource={projects}
            itemLayout="vertical"
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
                            type="primary"
                          >
                            Approve
                          </Button>,
                          // <Button
                          //   onClick={() => {
                          //     notifyGithub(item.fields.GithubURL, splitGithubs);
                          //     approve(item, true);
                          //   }}
                          //   type="primary"
                          // >
                          //   {"Approve & notify"}
                          // </Button>,
                          <Button
                            danger
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
                  <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                    <h1>
                      <a href={item.fields.GithubURL} style={{ color: "green" }}>
                        {item.fields.GithubURL}
                      </a>
                    </h1>
                    <SplitTable
                      splitAddress={undefined}
                      splitGithubURLs={item.fields.SplitGithubURLs.split("\n")}
                      percentAllocations={item.fields.PercentAllocations.split("\n").map(i =>
                        Math.round(parseFloat(i) * 1e4),
                      )}
                      receiveMoneyAddress={item.fields.ReceiveMoneyAddress}
                      communityPoolAddress={item.fields.CommunityPoolAddress || item.fields.ReceiveMoneyAddress}
                      communityPoolPercentage={Math.round(parseFloat(item.fields.CommunityPoolPercentage) * 1e6)}
                      githubURL={item.fields.GithubURL}
                    />
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
