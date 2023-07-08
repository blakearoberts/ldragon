import React, { useState } from 'react';

import {
  AstNode,
  ExpressionNode,
  GameCalculationIdentifier,
  Value,
} from '@blakearoberts/ldragon';
import {
  AddBoxOutlined,
  DisabledByDefaultOutlined,
  IndeterminateCheckBoxOutlined,
} from '@mui/icons-material';
import {
  TreeView,
  TreeItem as MuiTreeItem,
  TreeItemProps,
  treeItemClasses,
} from '@mui/lab';
import {
  Button,
  Card,
  CardHeader,
  Collapse,
  Typography,
  alpha,
  styled,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { useSpring, animated } from '@react-spring/web';
import { useEffectOnce } from 'usehooks-ts';

function TransitionComponent(props: TransitionProps) {
  const style = useSpring({
    from: {
      opacity: 0,
      transform: 'translate3d(20px,0,0)',
    },
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(${props.in ? 0 : 20}px,0,0)`,
    },
  });

  return (
    <animated.div style={style}>
      <Collapse {...props} />
    </animated.div>
  );
}

const TreeItem = styled((props: TreeItemProps) => (
  <MuiTreeItem {...props} TransitionComponent={TransitionComponent} />
))(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

interface TreeItemLabelProps {
  title: string;
  text?: string | number;
}

const TreeItemLabel: React.FC<TreeItemLabelProps> = ({ title, text }) => {
  return (
    <Typography component='span'>
      {title}
      {text === undefined ? (
        ''
      ) : (
        <>
          {' '}
          -{' '}
          <Typography color='text.secondary' component='span'>
            {text}
          </Typography>
        </>
      )}
    </Typography>
  );
};

interface ValueTreeItemProps {
  nodeId: string;
  value: Value;
}

const ValueTreeItem: React.FC<ValueTreeItemProps> = ({ nodeId, value }) => {
  switch (value.type) {
    case 'Constant':
      return (
        <TreeItem
          nodeId={nodeId + '_value'}
          label={
            <TreeItemLabel
              title={value.type}
              text={value.value.toLocaleString(undefined, {
                maximumFractionDigits: 3,
              })}
            />
          }
          children={
            value.stat !== undefined || value.formula !== undefined
              ? [
                  value.stat ? (
                    <TreeItem
                      key='stat'
                      nodeId={nodeId + '_stat'}
                      label={<TreeItemLabel title={'stat'} text={value.stat} />}
                    />
                  ) : undefined,
                  value.formula ? (
                    <TreeItem
                      key='formula'
                      nodeId={nodeId + '_formula'}
                      label={
                        <TreeItemLabel title={'formula'} text={value.formula} />
                      }
                    />
                  ) : undefined,
                ]
              : undefined
          }
        />
      );

    case 'AbilityLevel':
      return (
        <TreeItem
          nodeId={nodeId + '_value'}
          label={
            <TreeItemLabel
              title={value.type}
              text={value.values
                .map((v) =>
                  v.toLocaleString(undefined, {
                    maximumFractionDigits: 3,
                  }),
                )
                .join('/')}
            />
          }
          children={
            value.stat !== undefined || value.formula !== undefined
              ? [
                  value.stat ? (
                    <TreeItem
                      key='stat'
                      nodeId={nodeId + '_stat'}
                      label={<TreeItemLabel title={'stat'} text={value.stat} />}
                    />
                  ) : undefined,
                  value.formula ? (
                    <TreeItem
                      key='formula'
                      nodeId={nodeId + '_formula'}
                      label={
                        <TreeItemLabel title={'formula'} text={value.formula} />
                      }
                    />
                  ) : undefined,
                ]
              : undefined
          }
        />
      );

    case 'CharLevel':
      return (
        <TreeItem
          nodeId={nodeId + '_value'}
          label={<TreeItemLabel title={value.type} />}
        >
          <TreeItem
            nodeId={nodeId + '_value_1'}
            label={
              <TreeItemLabel
                title={'Level 1'}
                text={value.f(1).toLocaleString(undefined, {
                  maximumFractionDigits: 3,
                })}
              />
            }
          />
          <TreeItem
            nodeId={nodeId + '_value_18'}
            label={
              <TreeItemLabel
                title={'Level 18'}
                text={value.f(18).toLocaleString(undefined, {
                  maximumFractionDigits: 3,
                })}
              />
            }
          />
        </TreeItem>
      );

    case 'CharLevelBreakpoints':
      return (
        <TreeItem
          nodeId={nodeId + '_value'}
          label={<TreeItemLabel title={value.type} />}
        >
          <TreeItem
            nodeId={nodeId + '_value_1'}
            label={
              <TreeItemLabel
                title={'Level 1'}
                text={value.values[0].toLocaleString(undefined, {
                  maximumFractionDigits: 3,
                })}
              />
            }
          />
          <TreeItem
            nodeId={nodeId + '_value_18'}
            label={
              <TreeItemLabel
                title={'Level 18'}
                text={value.values[17].toLocaleString(undefined, {
                  maximumFractionDigits: 3,
                })}
              />
            }
          />
        </TreeItem>
      );
  }
};

interface GameCalculationTreeItemProps {
  nodeId: string;
  identifier: string;
  gc: GameCalculationIdentifier;
}

const GameCalculationTreeItem: React.FC<GameCalculationTreeItemProps> = ({
  nodeId,
  identifier,
  gc,
}) => {
  return (
    <TreeItem
      nodeId={nodeId + '_gc'}
      label={<TreeItemLabel title={gc.type} text={identifier} />}
    >
      {gc.parts.map((v, i) => (
        <ValueTreeItem key={i} nodeId={nodeId + '_gc_' + i} value={v} />
      ))}
      {gc.percent ? (
        <TreeItem nodeId={nodeId + '_gc_percent'} label='Percent' />
      ) : undefined}
    </TreeItem>
  );
};

interface ExpressionProps {
  node: ExpressionNode;
}

const Expression: React.FC<ExpressionProps> = ({ node }) => {
  const nodeId = node.i.toString();
  switch (node.value.type) {
    case 'DataValue':
    case 'Effect':
      return <ValueTreeItem nodeId={nodeId} value={node.value.value} />;

    case 'GameCalculation':
      return (
        <GameCalculationTreeItem
          nodeId={nodeId}
          identifier={node.identifier}
          gc={node.value}
        />
      );

    case 'GameCalculationModified':
      return (
        <TreeItem
          nodeId={nodeId}
          label={
            <TreeItemLabel title={node.value.type} text={node.identifier} />
          }
        >
          <GameCalculationTreeItem
            nodeId={nodeId}
            identifier={node.identifier}
            gc={node.value.gc}
          />
          <TreeItem
            nodeId={nodeId + '_multiplier'}
            label={<TreeItemLabel title='Multiplier' />}
          >
            <ValueTreeItem
              nodeId={nodeId + '_multiplier'}
              value={node.value.multiplier}
            />
          </TreeItem>
        </TreeItem>
      );
  }
};

interface Props {
  ast: AstNode;
}

export const AstTree: React.FC<Props> = ({ ast }) => {
  const [expanded, setExpanded] = useState<string[]>([]),
    nodeIds: string[] = [],
    visit: (_: AstNode) => React.ReactNode = (n) => {
      const nodeId = n.i.toString();
      nodeIds.push(nodeId);
      switch (n.type) {
        case 'Description':
          return (
            <TreeItem key={n.i} nodeId={nodeId} label={n.type}>
              {n.children.map(visit)}
            </TreeItem>
          );
        case 'Break':
        case 'ListItem':
          return <TreeItem key={n.i} nodeId={nodeId} label={n.type} />;
        case 'Element':
          return (
            <TreeItem
              key={n.i}
              nodeId={nodeId}
              label={<TreeItemLabel title={n.type} text={n.identifier} />}
            >
              {n.children.map(visit)}
            </TreeItem>
          );
        case 'Expression':
          return <Expression key={n.i} node={n} />;
        case 'Text':
        case 'Template':
          return (
            <TreeItem
              key={n.i}
              nodeId={nodeId}
              label={<TreeItemLabel title={n.type} text={n.value} />}
            />
          );
      }
    };

  useEffectOnce(() => {
    setExpanded([nodeIds[0]]);
  });

  return (
    <Card sx={{ width: '100%', p: 1 }}>
      <CardHeader
        title={
          <Typography variant='subtitle2'>Abstract Syntax Tree</Typography>
        }
        action={
          <Button
            onClick={() => setExpanded(expanded.length === 0 ? nodeIds : [])}
          >
            {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
          </Button>
        }
      />
      <TreeView
        expanded={expanded}
        onNodeToggle={(_, nodeIds: string[]) => setExpanded(nodeIds)}
        defaultCollapseIcon={<IndeterminateCheckBoxOutlined />}
        defaultExpandIcon={<AddBoxOutlined />}
        defaultEndIcon={<DisabledByDefaultOutlined />}
      >
        {visit(ast)}
      </TreeView>
    </Card>
  );
};
