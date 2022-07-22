import { Button, Table, Tag } from "antd";
import React, { useState, useEffect } from "react";
import { utils } from "ethers";
import { useContractReader } from "eth-hooks";

const columns = [
  {
    title: "Split Receipient",
    dataIndex: "name",
    key: "name",
    render: data => <a href={data.link}>{data.id}</a>,
  },
  {
    title: "Percent",
    dataIndex: "percent",
    key: "percent",
    render: data => `${data}%`,
  },
  {
    title: "Type",
    key: "tags",
    dataIndex: "tags",
    render: (_, { tags }) => (
      <>
        {tags.map(tag => {
          let color;
          switch (tag) {
            case "Community pool":
              color = "geekblue";
              break;
            case "Repo":
              color = "green";
              break;
            case "0xPARC":
              color = "purple";
              break;
            case "Individual":
              color = "yellow";
              break;
            default:
              color = "volcano";
          }

          return (
            <Tag color={color} key={tag}>
              {tag}
            </Tag>
          );
        })}
      </>
    ),
  },
];

export default function SplitTable({
  sinkGithubURL,
  splitGithubURLs,
  percentAllocations,
  receiveMoneyAddress,
  communityPoolAddress,
  communityPoolPercentage,
  githubURL,
}) {
  let tableData = [];
  if (githubURL === sinkGithubURL) {
    tableData = [
      {
        key: "0xPARC",
        name: { id: "0xPARC", link: sinkGithubURL },
        percent: 100,
        tags: ["0xPARC"],
      },
    ];
  } else {
    tableData.push({
      key: "team",
      name: { id: receiveMoneyAddress, url: `https://etherscan.io/address/${receiveMoneyAddress}` },
      percent: 50,
      tags: ["Team"],
    });
    tableData.push({
      key: "community pool",
      name: { id: communityPoolAddress, url: `https://etherscan.io/address/${communityPoolAddress}` },
      percent: communityPoolPercentage / 1e4,
      tags: ["Community pool"],
    });
    splitGithubURLs.forEach((githubURL, index) => {
      let secondHalf = githubURL.slice(githubURL.indexOf("github.com") + 11);
      tableData.push({
        key: githubURL,
        name: { id: secondHalf, url: githubURL },
        percent: percentAllocations[index] / 1e4,
        tags:
          githubURL === sinkGithubURL ? ["0xPARC"] : githubURL.split("/").length - 1 === 3 ? ["Individual"] : ["Repo"],
      });
    });
  }

  return <Table dataSource={tableData} columns={columns} bordered pagination={false} />;
}
