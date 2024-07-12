// #region IMPORTS
import type { IKChain } from '../IKChain';
import type Pose        from '../../armature/Pose';
import type IKTarget    from '../IKTarget';

import Transform        from '../../maths/Transform';
// #endregion

export default function deltaMoveSolver( tar: IKTarget, chain: IKChain, pose: Pose ): void{
    const pTran  = new Transform();         // Parent Bone WS Transform
    const cTran  = new Transform();         // Current Bone WS Transform ( parent.ws + lnk.bind )
    const ptInv  = new Transform();         // Invert Transform to Translate Position to Local Space
    const lnk    = chain.firstLink;

    pose.getWorldTransform( lnk.pindex, pTran );
    cTran.fromMul( pTran, lnk.bind );
    ptInv.fromInvert( pTran );

    cTran.pos.add( tar.deltaMove );         // Add Delta Movement to bone
    ptInv.transformVec3( cTran.pos );       // To Local Space
    pose.setLocalPos( lnk.index, cTran.pos );
}