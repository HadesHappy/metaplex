import React from 'react';
import {Layout} from "antd";
import {StaticPage} from "../../components/StaticPage";
import {example1} from "./testData";

export const StaticPageView = () => {
  return (
    <Layout style={{margin: 0, alignItems: 'center'}}>
      <StaticPage
        headContent={example1.headContent}
        midContent={example1.midContent}
      />
    </Layout>
  );
};
