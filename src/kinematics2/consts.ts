// #region IMPORTS
import type Pose            from '../armature/Pose';
import type IKTarget        from './IKTarget';
import type { IKChain }     from './IKChain';

import lookSolver           from './solvers/lookSolver';
import twoBoneSolver        from './solvers/twoBoneSolver';
import limbCompose          from './compose/limbCompose';
// #endregion

// #region TYPES

export type TIKSolver = ( tar: IKTarget, chain: IKChain, pose: Pose, Debug ?: any )=>void;

// #endregion

// #region CONSTANTS

export const IK_SOLVERS : Record<string, TIKSolver>  = {
    'look'      : lookSolver,
    'twoBone'   : twoBoneSolver,
    'limb'      : limbCompose,
};

// #endregion