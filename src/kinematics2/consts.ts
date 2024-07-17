// #region IMPORTS
import type Pose            from '../armature/Pose';
import type IKTarget        from './IKTarget';
import type { IKChain }     from './IKChain';

import rootCompose              from './compose/rootCompose';
import lookCompose              from './compose/lookCompose';
import limbCompose              from './compose/limbCompose';
import trapezoidCompose         from './compose/trapezoidCompose';
import zCompose                 from './compose/zCompose';
import swingTwistChainSolver    from './solvers/swingTwistChainSolver';
// #endregion

// #region TYPES

export type TIKSolver = ( tar: IKTarget, chain: IKChain, pose: Pose, Debug ?: any )=>void;

// #endregion

// #region CONSTANTS

export const IK_SOLVERS : Record<string, TIKSolver> = {
    'root'          : rootCompose,
    'look'          : lookCompose,
    'limb'          : limbCompose,
    'z'             : zCompose,
    'trapezoid'     : trapezoidCompose,
    'swingchain'    : swingTwistChainSolver,
};

// #endregion