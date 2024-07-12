// #region IMPORTS
import type Pose        from '../../armature/Pose';
import type IKTarget    from '../IKTarget';
import type { IKChain } from '../IKChain';

import lookSolver       from '../solvers/lookSolver';
import deltaMoveSolver  from '../solvers/deltaMoveSolver';
// #endregion

export default function rootCompose( target: IKTarget, chain: IKChain, pose: Pose ){
    target.resolveTarget( chain, pose );        // Resolve the target to the current pose data
    lookSolver( target, chain, pose );          // Align the the root bone to the target direction
    deltaMoveSolver( target, chain, pose );     // Move bone's position
}