// #region IMPORTS
import type Pose        from '../../armature/Pose';
import type IKTarget    from '../IKTarget';
import type { IKChain } from '../IKChain';

import lookSolver       from '../solvers/lookSolver';
import zSolver          from '../solvers/zSolver';
// #endregion

export default function zCompose( target: IKTarget, chain: IKChain, pose: Pose, debug: any ){
    // Resolve the target to the current pose data
    target.resolveTarget( chain, pose );

    // Align the the root bone to the target direction
    lookSolver( target, chain, pose );

    // If the target is to far away, straighten the limb
    // Else bend the mid joint using the idea of triangles
    if( target.dist >= chain.len ) chain.resetPoseLocal( pose, 1 );
    else                           zSolver( target, chain, pose, debug );
}