// #region IMPORTS
import type Pose        from '../../armature/Pose';
import type IKTarget    from '../IKTarget';
import type { IKChain } from '../IKChain';

import lookSolver       from '../solvers/lookSolver';
// #endregion

export default function lookCompose( target: IKTarget, chain: IKChain, pose: Pose ){
    target.resolveTarget( chain, pose );    // Resolve the target to the current pose data
    lookSolver( target, chain, pose );      // Align the the root bone to the target direction
}