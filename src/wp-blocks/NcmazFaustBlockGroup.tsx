import { NcmazFaustBlockGroupFragmentFragment } from "@/__generated__/graphql";
import BackgroundSection from "@/components/BackgroundSection/BackgroundSection";
import MyWordPressBlockViewer from "@/components/MyWordPressBlockViewer";
import classNames from "@/utils/classNames";
import { gql } from "@apollo/client";
import { WordPressBlock, getStyles, useBlocksTheme } from "@faustwp/blocks";
import React from "react";
//
const NcmazFaustBlockGroup: WordPressBlock<
  NcmazFaustBlockGroupFragmentFragment
> = (defaultProps) => {
  const props = {
    ...(defaultProps || {}),
    attributes: defaultProps?.aliasAttributes,
  };

  // get the BlocksTheme object
  const theme = useBlocksTheme();
  const style = getStyles(theme, { ...props });

  const { aliasAttributes: attributes } = props || {};
  const { className, hasBackground, variation } = attributes || {};

  return (
    <div
      className={`mb-8 NcmazFaustBlockGroup relative not-prose ${className || ""}`}
    >
      {hasBackground && (
        <BackgroundSection
          className={classNames(
            variation === "style2"
              ? "bg-yellow-100/70 dark:bg-black/20"
              : undefined,
            variation === "style3"
              ? "bg-green-100/70 dark:bg-black/20"
              : undefined,
            variation !== "style2" && variation !== "style3"
              ? "bg-neutral-100/70 dark:bg-black/20"
              : undefined
          )}
        />
      )}
      {/* @ts-ignore */}
      <MyWordPressBlockViewer blocks={props.children} />
    </div>
  );
};

export const NcmazFaustBlockGroupFragments = {
  entry: gql`
    fragment NcmazFaustBlockGroupFragment on NcmazFaustBlockGroup {
      aliasAttributes: attributes {
        style
        variation
        hasBackground
        className
      }
    }
  `,
  key: `NcmazFaustBlockGroupFragment`,
};

NcmazFaustBlockGroup.displayName = "NcmazFaustBlockGroup";
export default NcmazFaustBlockGroup;
