---
title: Graph Machine Learning
subtitle: From Network Science to Spectral Graph Filtering
description: 네트워크의 구조적·통계적 성질에서 출발해 Graph Representation Learning, Spectral Graph Filtering, 그리고 효율적인 수치 계산까지 연결하는 개념 노트.
category: Concept Notes
pubDate: 2026-11-25
tags:
  - Graph Theory
  - Network Science
  - Graph Machine Learning
  - Linear Algebra
  - Spectral Methods
  - Numerical Linear Algebra
---

## Overview

Graph는 데이터 사이의 관계를 표현한다. 이 노트는 관계 구조의 통계적 모델에서 출발해, graph 위의 신호를 표현하고 spectral filter를 설계·계산하는 방법을 다룬다. 기본적인 선형대수와 확률·통계를 전제로 한다.

| 분야 | 핵심 대상 | 질문 |
|---|---|---|
| Network Science | Graph $G$ | 관계 구조는 어떤 성질을 갖는가? |
| Statistical Network Analysis | 확률모형 $p(G\mid\theta)$ | 관측된 관계로부터 어떤 구조를 추론할 수 있는가? |
| Graph Representation Learning | 표현 $Z$ | 관계와 속성으로부터 유용한 feature를 어떻게 얻는가? |
| Graph Signal Processing | 연산자 $g(S)$ | Graph 위의 어떤 신호 성분을 보존하거나 제거할 것인가? |
| Graph Neural Networks | 학습 가능한 mapping | 관계를 활용하여 downstream task를 어떻게 해결하는가? |
| Numerical Linear Algebra | $g(S)x$의 계산 | 큰 행렬을 직접 저장하지 않고 연산을 수행할 수 있는가? |

Graph signal을 활용하는 많은 모델은 다음 구조로 이해할 수 있다.

$$
G\longrightarrow (S,X)\longrightarrow H_\theta(S)X\longrightarrow Z\longrightarrow \widehat Y.
$$

여기서 $S$는 관계를 행렬로 표현한 operator, $X$는 node 위의 feature matrix이다. 이 흐름은 주어진 graph 위의 신호를 처리하는 모델에 해당한다.

## 1. Network Science and Statistical Network Models

### 1.1 Graph를 행렬로 표현하기

Weighted undirected graph $G=(V,E,W)$에서 node 수를 $n$이라 하자. 기본적인 행렬은 다음과 같다.

- Adjacency matrix: $A_{ij}=w_{ij}$; edge가 없으면 0.
- Degree matrix: $D=\operatorname{diag}(d_i)$, $d_i=\sum_j A_{ij}$.
- Combinatorial Laplacian: $L=D-A$.
- Symmetric normalized adjacency: $S=D^{-1/2}AD^{-1/2}$.
- Symmetric normalized Laplacian: $L_{\mathrm{sym}}=I-S$.

Normalized operator는 양의 degree를 가진 node에 대해 정의한다. 고립 node가 있다면 별도의 convention이 필요하다. Directed graph에서는 adjacency의 행과 열 중 어느 쪽을 source로 정하는지 명시해야 한다.

행렬의 거듭제곱은 walk와 연결된다. Unweighted graph에서 $(A^k)_{ij}$는 node $i$에서 $j$로 가는 길이 $k$의 walk 수다. Weighted graph에서는 walk를 구성하는 edge weight의 곱을 모두 더한 값이다. 이는 정확히 distance $k$인 node를 나타내는 행렬과 다르다.

### 1.2 Structure를 요약하는 방법

| 통계량 | 측정하는 구조 |
|---|---|
| Degree / degree distribution | 직접 연결의 수와 분포 |
| Centrality | Node의 위치 또는 중요도 |
| Clustering coefficient | 이웃 사이의 국소적 연결 |
| Connected components | 도달 가능한 영역 |
| Density | 가능한 연결 중 실제 연결의 비율 |
| Assortativity | 특정 속성이 유사한 node끼리 연결되는 경향 |

Eigenvector centrality는 $Ac=\lambda c$로 표현된다. 연결된 비음수 adjacency에서는 Perron eigenvector를 중요도 지표로 이용할 수 있다.

PageRank와 Katz similarity는 여러 길이의 walk를 하나의 연산자로 결합하는 대표적인 예다. Column-stochastic transition matrix $P$, restart distribution $v$, $0<\alpha<1$에 대해

$$
\pi=\alpha v+(1-\alpha)P\pi=\alpha(I-(1-\alpha)P)^{-1}v.
$$

Neumann series를 적용하면

$$
\pi=\sum_{k=0}^{\infty}\alpha(1-\alpha)^kP^kv.
$$

Katz similarity는 $|\beta|\rho(A)<1$일 때 $\sum_{k\ge1}\beta^kA^k$로 나타난다. 두 방법 모두 walk의 길이에 따라 다른 가중치를 부여한다. 이는 뒤에서 다룰 polynomial 및 rational graph filtering의 직관적 출발점이다.

### 1.3 Statistical network models

관측된 graph를 고정된 진실로 보기보다는 특정 확률적 생성 과정에서 얻은 자료로 보는 관점이다.

| Model | 가정 | 활용 |
|---|---|---|
| Erdős–Rényi $G(n,p)$ | Edge의 독립적 생성 | 단순한 random graph 기준 |
| Configuration model | Degree를 보존하는 무작위 연결 | Degree 효과와 다른 구조적 효과의 구별 |
| Stochastic block model (SBM) | 잠재 group에 따라 연결 확률이 다름 | Community 및 mixing pattern의 추론 |
| Degree-corrected SBM | Group structure와 degree 이질성 분리 | Degree 편차가 큰 network |
| ERGM | Graph statistic을 sufficient statistic으로 사용 | Edge dependence의 모형화 |
| Latent space / eigenmodel | 잠재 공간에서의 관계로 edge 확률 결정 | Representation과 link probability 연결 |

SBM에서는 잠재 class $z_i$가 주어졌을 때 edge가 조건부 독립이라고 가정하고,

$$
\Pr(A_{ij}=1\mid z_i=a,z_j=b)=B_{ab}
$$

로 연결 확률을 표현한다. 단순한 assortative SBM은 대각 block의 연결 확률이 높고, disassortative SBM은 다른 block 간 연결이 더 많을 수 있다.

- 구조적 community는 downstream task의 label과 동일할 필요가 없다.
- 관측된 graph는 measurement error 또는 표본 추출의 영향을 받을 수 있다.
- 어떤 graph에서 모델이 잘 작동했다는 사실만으로 그 graph의 모든 edge가 유용하다고 결론 내릴 수는 없다.

### 1.4 Community detection과 spectral relaxation

단순 무방향 graph에서 edge 수를 $m$이라 하면 modularity는

$$
Q=\frac{1}{2m}\sum_{ij}\left(A_{ij}-\frac{d_id_j}{2m}\right)\mathbf1[z_i=z_j]
$$

이다. 실제 community 내부 연결을 degree 기반 null model 아래 기대 연결과 비교한다. Louvain과 Leiden은 community quality objective를 최적화하는 방법이며, spectral clustering과 동일한 알고리즘은 아니다.

한편 cut minimization의 discrete partition 문제를 연속적인 벡터 최적화로 완화하면 Laplacian의 eigenvector 문제가 등장한다. Spectral clustering은 이러한 spectral subspace의 좌표로 node를 표현하고 clustering을 수행한다.

**연결점:** network partition에 사용하던 eigenvector를 graph signal의 basis로 바라보면 Graph Fourier Transform으로 이어진다.

---

## 2. Spectral Graph Theory

### 2.1 Laplacian과 quadratic form

비음수 weight를 가진 무방향 graph의 Laplacian은 실대칭이며 positive semidefinite이다.

$$
x^\top Lx=\sum_{\{i,j\}\in E}w_{ij}(x_i-x_j)^2\ge0.
$$

이 식은 graph 위에서 signal $x$가 얼마나 변화하는지 측정한다. 연결된 node에서 값이 비슷하다면 작고, 값의 차이가 크다면 커진다.

Spectral theorem에 따라

$$
L=U\Lambda U^\top,\qquad \Lambda=\operatorname{diag}(\lambda_1,\ldots,\lambda_n),\qquad U^\top U=I.
$$

정규화된 eigenvector $u_i$는 $u_i^\top Lu_i=\lambda_i$를 만족한다. 따라서 Laplacian eigenvalue는 각 mode의 variation으로 해석할 수 있다.

- 연결된 graph에서 unnormalized Laplacian의 zero mode는 constant vector이다.
- Normalized Laplacian의 zero mode는 일반적으로 $D^{1/2}\mathbf1$에 비례한다.
- 작은 eigenvalue는 smooth mode, 큰 eigenvalue는 variation이 큰 mode에 대응한다.
- 높은 variation이 반드시 noise라는 뜻은 아니다. Task에 필요한 차이를 표현할 수 있다.

### 2.2 Graph Fourier Transform (GFT)

Graph signal $x\in\mathbb R^n$을 eigenbasis에서 표현하면

$$
\widehat x=U^\top x,\qquad x=U\widehat x=\sum_i\widehat x_i u_i.
$$

그러므로

$$
x^\top Lx=\sum_i\lambda_i|\widehat x_i|^2.
$$

| 대상 | 의미 |
|---|---|
| Eigenvalue $\lambda_i$ | Mode의 graph variation |
| Eigenvector $u_i$ | Graph 위의 공간적 pattern |
| Fourier coefficient $\widehat x_i$ | 입력 signal에서 해당 pattern의 크기와 부호 |

일반적으로 graph shift operator의 eigenvalue를 frequency라고 부를 수 있지만, low/high frequency의 순서는 operator와 variation 정의에 의존한다. Laplacian에서는 큰 eigenvalue가 높은 variation에 대응하지만 normalized adjacency에서는 대개 큰 eigenvalue가 낮은 Laplacian frequency에 대응한다.

### 2.3 Canonical example: 3-node path

$1\leftrightarrow2\leftrightarrow3$에 대해

$$
L=\begin{pmatrix}1&-1&0\\-1&2&-1\\0&-1&1\end{pmatrix}.
$$

Eigenvalue는 $0,1,3$이고, 대응하는 orthonormal eigenvector는

$$
u_0=\frac1{\sqrt3}(1,1,1)^\top,\quad u_1=\frac1{\sqrt2}(1,0,-1)^\top,\quad u_3=\frac1{\sqrt6}(1,-2,1)^\top.
$$

- $u_0$: 전체 평균.
- $u_1$: 양 끝 node의 차이.
- $u_3$: 중앙과 양 끝 node의 대비.

예를 들어 $x=(10,20,10)^\top$는 양 끝 값이 같으므로 $\widehat x_1=0$이다.

$$
x=\frac{40}{3}\mathbf1+\begin{pmatrix}-10/3\\20/3\\-10/3\end{pmatrix}.
$$

두 번째 항은 $u_3$ 방향이다. 평균 mode만 보존하는 filter는 $x$를 $(40/3)\mathbf1$로 보낸다. 반대로 평균을 제거하는 filter는 중앙과 양 끝의 차이를 남긴다.

### 2.4 Spectral basis와 eigenspace의 비유일성

$Lu=\lambda u$이면 $L(-u)=\lambda(-u)$이다. Repeated eigenvalue의 eigenspace에 대해서는 orthonormal basis 자체도 유일하지 않다. $U_E$가 해당 eigenspace의 basis이고 $Q$가 orthogonal이면 $U_EQ$도 같은 공간의 basis다.

그러나 projector는

$$
(U_EQ)(U_EQ)^\top=U_EU_E^\top
$$

로 일정하다. Scalar spectral filter는 각 eigenspace의 projector를 사용하므로 basis 선택에 독립적이다. 개별 eigenvector를 node feature로 쓰는 경우에는 sign과 basis의 비유일성을 고려해야 한다.

---

## 3. Graph Signal Processing and Filter Design

### 3.1 Graph shift operator와 polynomial filtering

Graph shift operator (GSO) $S$는 graph의 edge structure를 따라 node 사이 정보를 이동시키는 행렬이다. 대표적으로 adjacency, Laplacian, normalized adjacency 등을 선택할 수 있다.

$$
H(S)=\sum_{k=0}^K h_kS^k,\qquad y=H(S)x.
$$

이 연산을 두 방식으로 해석할 수 있다.

- Vertex domain: $S^kx$는 최대 $k$-hop 범위의 정보를 반영한다. $h_k$는 각 propagation step의 가중치이다.
- Spectral domain: 실대칭 $S=U\Lambda U^\top$이면

$$
g(\lambda)=\sum_{k=0}^K h_k\lambda^k,\qquad H(S)=U\operatorname{diag}(g(\lambda_i))U^\top.
$$

$$
\widehat y_i=g(\lambda_i)\widehat x_i.
$$

즉 polynomial convolution은 graph 위의 propagation과 spectral gain 조절을 동시에 표현한다. 위 직교분해는 symmetric GSO를 가정한다. 일반 diagonalizable operator에서는 inverse basis를 사용하며 nonnormal 또는 defective operator에는 별도 분석이 필요하다.

### 3.2 Polynomial filter의 기본 성질

| 성질 | 의미 |
|---|---|
| Linearity | 입력에 대한 linear map |
| Shift invariance | $H(S)S=SH(S)$ |
| Locality | $K$차 polynomial은 최대 $K$-hop에 의존 |
| Parameter sharing | 모든 node에 공통 계수 $h_k$ 사용 |
| Permutation equivariance | Node index를 바꿔도 출력이 동일하게 재배열됨 |
| Efficient computation | Sparse operator의 반복 곱으로 계산 가능 |

Permutation matrix $\Pi$에 대해 $S'=\Pi S\Pi^\top$, $x'=\Pi x$이면

$$
H(S')x'=\Pi H(S)x.
$$

이는 $(\Pi S\Pi^\top)^k=\Pi S^k\Pi^\top$에서 바로 얻어진다.

Sparse GSO에서 단일 signal에 대한 계산은 보통 $O(K(|E|+n))$에 수행할 수 있다. $S^k$나 $H(S)$를 명시적으로 만들 필요가 없다는 점이 중요하다. 입력 channel 수, backward pass, dense graph의 비용은 이 식에 포함되어 있지 않다.

### 3.3 Frequency response

| 유형 | 보존하려는 성분 | 예시 (Laplacian frequency) |
|---|---|---|
| Low-pass | Smooth component | $g(\lambda)=(1+\alpha\lambda)^{-1}$ |
| High-pass | Local contrast | $g(\lambda)=\lambda$ |
| Band-pass | 특정 frequency 구간 | 중간 구간에서 gain이 큰 함수 |
| Band-stop | 특정 frequency 구간을 억제 | 낮은 및 높은 성분은 보존 가능 |

Gain의 부호와 magnitude를 구별해야 한다. 예를 들어 $g(\lambda)=1-\lambda$는 감소함수지만 $|g(\lambda)|$는 $[0,2]$ 전체에서 감소하지 않는다. 따라서 단순히 함수가 감소한다고 모든 high-frequency component가 약해지는 것은 아니다.

### 3.4 Operator matching과 identification

Filter design은 무엇이 주어졌는지에 따라 달라진다.

- Operator matching: 목표 operator $B$가 주어진 경우

$$
\min_h\left\|B-\sum_{k=0}^K h_kS^k\right\|_F^2.
$$

- System identification: input/output pair $(x^{(t)},y^{(t)})$가 주어진 경우

$$
\min_h\sum_t\left\|y^{(t)}-\sum_{k=0}^K h_kS^kx^{(t)}\right\|_2^2.
$$

- Task-driven learning: classification, regression, ranking 등에 적합한 loss로 parameter를 선택하는 경우.

Operator approximation error와 downstream performance는 다른 대상이다. 원하는 연산을 정확히 구현했다고 해서 그 연산 자체가 task에 적합하다는 뜻은 아니다.

### 3.5 Exact spectral interpolation

실대칭 $S$가 서로 다른 eigenvalue $\mu_1,\ldots,\mu_r$를 가진다고 하자. 각 eigenspace에 scalar gain $b_1,\ldots,b_r$를 부여하고 싶다면 Lagrange interpolation을 통해

$$
g(t)=\sum_{i=1}^r b_i\prod_{j\ne i}\frac{t-\mu_j}{\mu_i-\mu_j}
$$

로 표현할 수 있다. Degree는 최대 $r-1$이다. 따라서 각 eigenspace에 scalar로 작용하는 목표 operator는 정확한 polynomial filter로 나타낼 수 있다.

**한계:** 동일 eigenvalue를 가진 두 방향에 서로 다른 gain을 부여할 수 없다. Polynomial은 eigenvalue의 함수이기 때문이다. 단순히 eigenvector basis에서 diagonal인 것만으로 충분하지 않고, repeated eigenspace 안에서 gain이 같아야 한다.

3-node path에서 $g(0)=1$, $g(1)=g(3)=0$을 원하면

$$
g(t)=\frac{(t-1)(t-3)}{3}=1-\frac43t+\frac13t^2.
$$

이 filter는 정확한 평균 projection을 구현한다.

### 3.6 Polynomial basis와 approximation

Monomial, Chebyshev, Bernstein, Jacobi는 같은 degree의 polynomial 공간을 표현하는 서로 다른 basis이다.

$$
\mathbb P_K=\operatorname{span}\{1,t,\ldots,t^K\}.
$$

완전한 basis를 사용하고 계수에 제약을 두지 않으면 표현 가능한 함수공간은 같지만, coefficient conditioning, approximation objective, optimization 및 제약 조건은 달라질 수 있다.

Chebyshev polynomial은 $[-1,1]$에서 다음 recurrence를 갖는다.

$$
T_0(t)=1,\qquad T_1(t)=t,\qquad T_{k+1}(t)=2tT_k(t)-T_{k-1}(t).
$$

$S$의 spectrum을 $[-1,1]$에 맞춘 뒤 $T_k(S)x$를 recurrence로 계산할 수 있다. Bernstein basis와 spectral scaling은 Section 8에서 다룬다.

### 3.7 Polynomial을 넘어

| Filter | 형태 / 아이디어 | 특징 |
|---|---|---|
| Rational | $p(S)q(S)^{-1}$ | Sharp response를 낮은 차수로 근사할 가능성; inverse 및 solver 필요 |
| Node-varying | $\sum_k\operatorname{diag}(h_k)S^k$ | Node별 weight; parameter 수 증가 |
| Edge-varying | Edge별 연산 | 더 세밀한 propagation; 학습·계산 비용 증가 |
| Volterra / median | Nonlinear interaction / order statistic | 비선형 구조 및 outlier 처리 |
| Multi-GSO | 여러 관계 operator $S_a$ | 관계별 정보 유지; 공통 eigenbasis가 일반적으로 없음 |
| Wiener | Covariance와 noise model 이용 | 주어진 통계적 가정 하 최적 linear estimator |

Tikhonov regularization은 optimization에서 rational filter가 자연스럽게 등장하는 예다. $L\succeq0$, $\alpha\ge0$일 때

$$
\arg\min_z\{\|z-x\|_2^2+\alpha z^\top Lz\}=(I+\alpha L)^{-1}x.
$$

일차조건 $(I+\alpha L)z=x$에서 얻어지며 frequency response는 $g(\lambda)=1/(1+\alpha\lambda)$이다. Trend filtering이나 total variation은 quadratic smoothness와 달리 일부 큰 변화를 허용하는 sparse difference prior를 사용할 수 있다.

### 3.8 Filter banks and wavelets

하나의 filter가 signal을 하나의 representation으로 변환한다면 filter bank는 여러 response를 병렬로 적용한다.

$$
z_a=H_ax,\qquad \widetilde x=\sum_aH_a^*z_a.
$$

위와 같이 adjoint synthesis를 사용하는 undecimated bank에서 perfect reconstruction의 조건은

$$
\sum_aH_a^*H_a=I.
$$

공통 orthonormal spectral basis를 사용하는 경우

$$
\sum_a|g_a(\lambda_i)|^2=1\quad\text{for every }i
$$

로 환원된다. 이는 Parseval tight frame 조건으로, 분석 계수의 총 에너지가 원래 signal의 에너지와 같다. 일반 synthesis filter를 별도로 선택하는 경우에는 그에 맞는 복원 조건을 사용해야 한다.

Graph wavelet은 공간적으로 국소적이고 여러 scale을 표현하는 representation을 지향한다. Global Fourier mode가 국소적 사건을 표현하는 데 많은 component를 필요로 할 수 있기 때문이다. Downsampling과 coarsening을 도입하면 어느 node를 남기고 축소된 graph를 어떻게 정의할지 추가로 결정해야 한다.

## 4. Graph Representation Learning and GNNs

### 4.1 Learning tasks와 encoder–decoder

Graph learning의 목표는 task에 따라 다르다.

| Task | 출력 |
|---|---|
| Node classification / regression | Node별 label 또는 연속값 |
| Link / relation prediction | Node pair의 관계 점수 |
| Graph classification / regression | Graph 전체의 label 또는 연속값 |
| Clustering | 잠재적 group |

Graph representation learning은 각 node 또는 graph를 벡터로 표현하여 이러한 task를 해결한다. 일반적인 node embedding은

$$
z_i=\operatorname{ENC}(i;G,X),\qquad \widehat s_{ij}=\operatorname{DEC}(z_i,z_j)
$$

와 같은 encoder–decoder 관점에서 이해할 수 있다.

- Shallow embedding: node마다 벡터를 직접 학습한다. Matrix factorization과 random-walk 기반 embedding은 graph proximity를 저차원 표현에 보존하려 한다.
- GNN: graph와 feature로부터 공유 parameter를 이용해 embedding을 생성한다. 학습된 encoder를 새로운 node에 적용할 수 있는지는 architecture와 입력 정보에 의존한다.
- Multi-relational graph: $(i,r,j)$의 relation type $r$에 따라 다른 encoder 또는 decoder를 사용할 수 있다.

Transductive learning에서는 학습 시 graph의 일부 또는 전체 구조가 알려질 수 있다. Inductive learning에서는 보지 못한 node나 graph에 대한 일반화가 필요하다. Graph의 관측값들이 독립이라는 가정은 일반적으로 적절하지 않다.

### 4.2 Message passing

Node $i$의 layer $\ell$에서의 representation을 $h_i^{(\ell)}$라 하자.

$$
m_i^{(\ell)}=\operatorname{AGG}_\ell\{\phi_\ell(h_i^{(\ell)},h_j^{(\ell)},e_{ij}):j\in\mathcal N(i)\},
$$

$$
h_i^{(\ell+1)}=\operatorname{UPDATE}_\ell(h_i^{(\ell)},m_i^{(\ell)}).
$$

- Aggregation: sum, mean, max, attention 등의 방식으로 이웃의 정보를 결합한다.
- Update: 자기 feature와 이웃 정보를 조합한다. Residual, gating, concatenation 등으로 기존 정보를 보존할 수 있다.
- Readout: node representation들을 graph-level representation으로 결합한다.

이웃의 순서가 임의적이므로 aggregation은 일반적으로 permutation-invariant해야 한다. Node indexing을 바꾼 전체 출력은 이에 대응해 재배열되는 것이 자연스럽다.

### 4.3 Graph filter에서 GNN으로

다채널 polynomial filtering을 다음과 같이 쓸 수 있다.

$$
X^{(\ell+1)}=\sigma\left(\sum_{k=0}^K S^k X^{(\ell)}W_{\ell,k}\right).
$$

$S^k$는 node 사이의 propagation, $W_{\ell,k}$는 feature channel mixing, $\sigma$는 nonlinear activation이다. 이 세 연산의 역할을 구별해야 한다.

| 설계 요소 | 주로 바꾸는 것 |
|---|---|
| Filter order $K$ | 한 layer의 최대 propagation radius |
| Channel dimension | 표현 가능한 feature의 수 |
| Depth | 여러 연산의 합성과 nonlinear feature extraction |

Activation을 제거하고 scalar polynomial filter만 합성하면 $g_2(S)g_1(S)=(g_2g_1)(S)$이므로 하나의 polynomial로 축약된다. 깊이를 늘린다고 자동으로 새로운 종류의 연산을 얻는 것은 아니다.

Spatial message passing과 spectral graph filtering은 상호 배타적이지 않다. Polynomial spectral filter는 eigendecomposition 없이 local matrix multiplication으로 구현할 수 있다.

### 4.4 GCN과 PageRank propagation

Self-loop를 추가한 adjacency와 normalization을

$$
\bar A=A+I,\quad \bar D_{ii}=\sum_j\bar A_{ij},\quad S=\bar D^{-1/2}\bar A\bar D^{-1/2}
$$

로 정의하면, 대표적인 GCN layer는

$$
X^{(\ell+1)}=\sigma(SX^{(\ell)}W_\ell)
$$

이다. Spectral convolution의 1차 근사와 parameter tying을 통해 동기를 설명할 수 있다. 다만 adjacency renormalization은 operator를 바꾸므로 원래 Laplacian에 대한 단순 polynomial과 정확히 같지는 않다.

$L'=I-S$를 기준으로 propagation $S$의 frequency response는 $g(\lambda)=1-\lambda$이다. 부호가 있는 gain은 감소하지만 $|g(\lambda)|$가 전체 구간에서 단조 감소하지 않는다는 점에 주의해야 한다.

반복 propagation의 극한은 oversmoothing의 기본적인 원리를 보여준다. 연결된 graph의 symmetric normalized adjacency $S$가 aperiodic이고 eigenvalue 1 이외의 eigenvalue들이 절댓값 1보다 작다면

$$
S^k\longrightarrow u_1u_1^\top.
$$

$u_1$은 정규화된 dominant eigenvector이다. 따라서 반복적인 선형 propagation은 나머지 mode를 억제한다. 실제 nonlinear GNN에서는 activation과 residual 등에 따라 거동이 달라질 수 있다.

PageRank diffusion에서는 restart를 도입한다.

$$
\alpha(I-(1-\alpha)P)^{-1}=\sum_{k=0}^\infty \alpha(1-\alpha)^kP^k.
$$

PPNP는 personalized PageRank에 기반한 propagation을 사용하고 APPNP는 이를 반복적으로 근사한다. GPR-GNN은 finite polynomial의 propagation coefficient 자체를 학습하는 접근이다.

$$
Z=\sum_{k=0}^K\gamma_kS^kZ_0.
$$

따라서 몇 hop의 정보가 중요한지, 서로 다른 hop의 정보를 어떤 비율로 결합할지 학습할 수 있다. 음의 계수도 허용하면 단순 smoothing에 제한되지 않는다.

---

## 5. Spectral Architectures and Mathematical Guarantees

### 5.1 Eigenvalue-based와 eigenvector-based 접근

실대칭 graph operator의 spectral filter는

$$
g(S)=\sum_i g(\lambda_i)u_iu_i^\top
$$

이다. $g(\lambda_i)$는 각 mode의 gain이며 $u_iu_i^\top$는 해당 mode에 대한 projector다.

- Eigenvalue-based method는 주로 frequency response를 어떻게 구성하거나 학습할지에 집중한다.
- Eigenvector-based method는 spectral basis에서 얻는 위치, 방향, 국소적 구조 등의 정보를 representation에 활용한다.

두 방법 모두 eigenvalue와 eigenvector를 사용할 수 있으므로 완전히 배타적인 수학적 범주는 아니다.

### 5.2 Spectral architecture의 계열

| 계열 | 대표 모델 | 주요 아이디어 |
|---|---|---|
| Explicit / advanced | SpectralCNN | Spectral mode에 직접 gain 부여 |
| Explicit / advanced | LanczosNet | Lanczos를 이용한 spectral approximation |
| Explicit / advanced | Specformer | Eigenvalue 사이 관계를 attention으로 학습 |
| Polynomial | ChebNet | Chebyshev basis와 recurrence |
| Polynomial | ChebNetII | Chebyshev interpolation 기반 parameterization |
| Polynomial | GPR-GNN | Propagation coefficient 학습 |
| Polynomial | BernNet | Bernstein basis를 활용한 response 설계 |
| Polynomial | JacobiConv | Spectral distribution을 고려할 수 있는 Jacobi basis |
| Rational | CayleyNet, GraphARMA | Rational function 또는 iterative approximation |
| First-order / adaptive | GCN, FAGCN, AdaGNN | 상대적으로 단순하거나 adaptive한 propagation |

Explicit spectral method는 유연한 표현을 제공할 수 있지만 eigendecomposition, basis 저장, graph 간 일반화의 비용이 존재한다. Polynomial 계열은 sparse matrix multiplication으로 구현할 수 있지만 차수 및 coefficient에 따라 수치 문제가 발생할 수 있다. Rational 계열은 sharp response를 표현할 수 있는 대신 linear system 계산이나 반복법이 필요하다.

이 표는 Bo et al.의 분류를 operator 관점에서 재구성한 것이다. 개별 모델의 정확한 architecture 또는 성능 순위를 나타내지는 않는다. 같은 degree의 완전한 polynomial basis는 동일한 함수공간을 표현하므로 모델 간 성능 차이는 제약, optimization, initialization, conditioning 등에도 의존한다.

### 5.3 Spectral basis를 표현으로 이용하기

| 방법 | 대표 예시 | 목적 |
|---|---|---|
| Wavelet basis | GWNN | Localized multiscale representation |
| Conjugate / Hermitian basis | MagNet | Directed graph의 방향 정보 반영 |
| Basis encoder | SAN, SignNet, PEG | Spectral positional information 활용 |

Directed graph의 adjacency는 일반적으로 symmetric하지 않다. Hermitian operator $L_H=L_H^*$는 복소수 entry를 허용하지만 eigenvalue는 실수이며 unitary diagonalization이 가능하다. Complex phase에 방향 정보를 담는 방법을 생각할 수 있다.

Eigenvector를 positional feature로 직접 쓰는 경우 Section 2.4의 sign 및 basis ambiguity가 중요하다. 동일한 graph가 eigendecomposition의 임의 선택에 따라 다른 feature를 갖지 않도록 invariance 또는 equivariance를 설계해야 한다.

### 5.4 Expressiveness

표준 permutation-invariant multiset aggregation을 사용하는 MPNN의 graph 구별 능력은 일반적인 초기 feature 및 readout 가정 아래 1-WL test에 의해 제한된다. 모든 MPNN이 그 상한을 달성하는 것은 아니다. 일부 spectral positional encoding 또는 더 일반적인 spectral operator는 이 제약을 넘어서는 구조 정보를 제공할 수 있지만, 모든 spectral GNN이 그런 것은 아니다.

고정된 symmetric $S$에 대해서는 scalar polynomial filter의 표현력을 직접 확인할 수 있다. 모든 eigenvalue가 서로 다르고 입력 $x$의 Fourier coefficient가 모두 0이 아니라면,

$$
g(\lambda_i)=\frac{\widehat y_i}{\widehat x_i}
$$

로 정하고 보간하여 원하는 하나의 출력 $y$를 얻을 수 있다.

조건의 의미는 다음 두 반례에서 나타난다.

- Missing frequency: $\widehat x_j=0$이면 어떠한 scalar gain도 $\widehat y_j\ne0$를 만들 수 없다.
- Repeated eigenvalue: $S=\lambda I$이면 $g(S)=g(\lambda)I$이므로 서로 다른 방향을 독립적으로 변환할 수 없다.

이는 고정된 graph와 하나의 input/output pair에 대한 선형 연산의 표현 가능성이다. 모든 입력과 임의의 graph에 대한 GNN의 universal approximation 정리로 일반화할 수 없다.

### 5.5 Stability와 transferability

동일한 크기의 두 operator $S,T$와 submultiplicative matrix norm에 대해 $\|S\|,\|T\|\le M$이라 하자. 다음 identity가 성립한다.

$$
S^k-T^k=\sum_{j=0}^{k-1}S^j(S-T)T^{k-1-j}.
$$

따라서 $g(t)=\sum_{k=0}^Kh_kt^k$일 때

$$
\|g(S)-g(T)\|\le\|S-T\|\sum_{k=1}^K k|h_k|M^{k-1}.
$$

즉 차수, coefficient의 크기, operator의 scale이 perturbation에 대한 민감도에 영향을 준다. 위 식은 polynomial에 대한 기본적인 보조 유도이며, 모든 종류의 graph 변화나 GNN에 적용되는 일반 정리는 아니다.

Transferability는 다른 graph에 같은 parameter를 사용할 수 있다는 사실보다 강한 개념이다. 의미 있는 출력 비교를 위해서는 node 또는 signal의 대응, operator의 변화, task의 유사성을 함께 고려해야 한다. 두 graph의 eigenvalue가 같아도 eigenbasis나 입력 signal이 다르면 filter output은 달라질 수 있다.

---

## 6. Homophily, Heterophily and Failure Mechanisms

### 6.1 Homophily의 측정

Categorical label $y_i$를 가진 단순 무방향 graph를 생각하자. Edge homophily와 node homophily는 각각

$$
h_{\mathrm{edge}}=\frac{1}{|E|}\sum_{\{i,j\}\in E}\mathbf1[y_i=y_j],
$$

$$
h_{\mathrm{node}}=\frac1n\sum_i\frac{1}{d_i}\sum_{j\in\mathcal N(i)}\mathbf1[y_i=y_j]
$$

이다. 두 번째 식은 양의 degree를 가진 node를 가정한다. 고립 node에 대해서는 제외 등 별도 convention을 명시한다.

Edge homophily는 degree가 큰 node에 더 큰 영향을 받는다. Node homophily는 node별 동일한 가중치를 사용한다. Class homophily는 class 비율을 고려하여 class별 mixing을 보정한다.

Class $c$의 degree mass를

$$
q_c=\frac{\sum_{i:y_i=c}d_i}{2|E|}
$$

라고 할 때 adjusted homophily는 분모가 양수인 경우

$$
h_{\mathrm{adj}}=\frac{h_{\mathrm{edge}}-\sum_cq_c^2}{1-\sum_cq_c^2}
$$

로 정의할 수 있다. 관측된 같은 class의 edge 비율을 random mixing baseline과 비교한다.

Compatibility matrix는 단일 homophily score보다 더 많은 정보를 담는다.

$$
C_{ab}=\Pr(y_j=b\mid y_i=a,\ i\sim j).
$$

Label homophily, feature homophily, structural similarity는 서로 다른 개념이다. Homophily는 관측한 attribute와 task에 상대적이다. 연속형 target에는 categorical label homophily 대신 graph smoothness, spectral energy, correlation 등의 지표를 고려할 수 있다.

### 6.2 Counterexample: 낮은 homophily가 유용한 graph

짝수 개 node의 cycle에서 class가 $+1,-1,+1,-1,\ldots$로 교대로 나타난다고 하자. 모든 edge가 다른 class를 연결하므로 edge homophily는 0이다.

하지만 $S=A/2$, $x=(1,-1,1,-1,\ldots)^\top$이면

$$
Sx=-x,\qquad S^2x=x.
$$

즉 1-hop 이웃은 label의 반대 부호를, 2-hop 이웃은 같은 부호를 제공한다. 자기 정보와 이웃 정보를 평균하는 연산은

$$
\frac{I+S}{2}x=0
$$

이므로 오히려 class 정보를 제거한다.

**핵심:** 낮은 homophily가 관계 자체에 정보가 없다는 뜻은 아니다. 그 정보를 활용하는 aggregation 방식이 적절한지가 중요하다. 실제 graph가 이 예시처럼 규칙적으로 구성된다고 가정할 수는 없으며, 고차 이웃이 항상 유용한 것도 아니다.

### 6.3 세 가지 다른 실패 메커니즘

| 현상 | 원인 | 대응 방식 |
|---|---|---|
| Heterophily-related mismatch | 이웃 정보의 단순 결합이 task에 유용한 차이를 제거 | Signed propagation, multi-band filter, hop 분리 |
| Oversmoothing | 반복 propagation으로 node representation의 구별 능력 감소 | Skip / residual, learned propagation |
| Oversquashing | 많은 distant signal이 제한된 connectivity와 representation에 압축 | Rewiring, long-range interaction, attention |

이들은 함께 나타날 수 있지만 같은 현상이 아니다. 문제의 원인을 확인하지 않은 채 layer 수나 모델의 복잡도를 늘리는 것은 근본적인 해결책이 아닐 수 있다.

### 6.4 Heterophily-aware architecture

Gong et al.의 분류에 따르면 주요 접근을 다음과 같이 정리할 수 있다.

| 계열 | 바꾸는 대상 | 예시 |
|---|---|---|
| Spectral graph filters | Frequency response | GPR-GNN, BernNet |
| High-order neighbors | Propagation 거리 | H2GCN, MixHop, FSGNN |
| Global homophily | 정보 전달 대상 | Geom-GCN, GloGNN |
| Discriminative message passing | Edge 또는 message별 중요도 | Signed, adaptive propagation |
| Graph Transformers | Locality에 제한되지 않는 상호작용 | Structural / positional encoding과 attention |
| Neural diffusion | Propagation dynamics | Reaction–diffusion, ODE 기반 방법 |

이 분류는 방법의 주된 설계 동기를 기준으로 하며 서로 중첩될 수 있다. Self-supervised learning에서는 augmentation과 positive pair를 구성할 때도 task에 맞는 관계가 중요하다. Graph structure learning, robustness, scalability 또한 architecture 밖에서 고려할 문제다.

---

## 7. Numerical Methods for Graph Filtering

### 7.1 Operator와 operator action의 구별

수학적으로 $y=g(P)r$를 정의하는 것과 $g(P)$의 모든 entry를 계산하는 것은 다른 문제다. 큰 행렬의 특정 vector에 대한 작용만 필요할 때는 matrix-free computation을 고려할 수 있다.

예를 들어 $C\in\mathbb R^{n\times m}$이고 $P=C^\top C$라면

$$
Px=C^\top(Cx).
$$

$C$가 sparse여도 Gram matrix $P$는 dense할 수 있다. 한 user가 여러 item과 상호작용하면 item projection에서 clique가 만들어질 수 있기 때문이다.

$z=\operatorname{nnz}(C)$라 하면 matrix-free product의 sparse arithmetic은 $O(z)$이며, vector 초기화 및 저장 비용까지 포함하면 $O(z+n+m)$ 정도로 생각할 수 있다. Dense $P$를 구성하면 $O(m^2)$ 저장 공간이 필요하다.

### 7.2 Polynomial action의 직접 계산

$$
g(P)r=\sum_{j=0}^d a_jP^jr
$$

을 계산하고자 한다. 가장 단순한 방식은 $v_0=r$, $v_{j+1}=Pv_j$로 두고 누적하는 것이다. Factorized operator에서는 $Pv_j=C^\top(Cv_j)$를 사용한다. Horner evaluation도 가능하다.

같은 graph와 input에 대해 여러 polynomial을 평가할 때는

$$
V=[r,Pr,\ldots,P^dr],\qquad g(P)r=Va
$$

와 같이 power vectors를 재사용할 수 있다. 단일 filter에는 streaming recurrence가 적절할 수 있지만, 여러 filter에서는 cache가 반복 계산을 줄일 수 있다. Cache가 커질수록 메모리 비용도 증가한다.

### 7.3 Krylov subspace

고정된 operator $P$와 $r\ne0$에 대해

$$
\mathcal K_q(P,r)=\operatorname{span}\{r,Pr,\ldots,P^{q-1}r\}
$$

를 Krylov subspace라 한다. $\deg g<q$이면 $g(P)r\in\mathcal K_q(P,r)$이다.

전체 공간은 $m$차원이더라도 하나의 polynomial action에 필요한 부분공간은 최대 $q$차원이다. 이는 **고정된 입력에 대한 action의 표현**이지, 전체 operator가 low-rank라는 뜻이 아니다. 입력이 바뀌면 Krylov subspace도 일반적으로 바뀐다.

### 7.4 Lanczos algorithm

$P$가 실대칭이라고 하자. Lanczos algorithm은 Krylov subspace의 orthonormal basis를 생성한다.

초기화: $q_1=r/\|r\|_2$, $q_0=0$, $\beta_0=0$. 각 iteration에서

$$
w=Pq_j-\beta_{j-1}q_{j-1},\qquad \alpha_j=q_j^\top w,
$$

$$
w\leftarrow w-\alpha_jq_j,\qquad \beta_j=\|w\|_2,
$$

$$
q_{j+1}=w/\beta_j\quad(\beta_j\ne0).
$$

정확한 산술에서 $\beta_j=0$이면 더 진행할 필요가 없다. 생성된 subspace가 $P$에 대해 invariant하기 때문이다. $r=0$이면 초기화 없이 0을 반환한다.

$Q=[q_1,\ldots,q_q]$에 대해 $Q^\top Q=I$이고, projected operator $T=Q^\top PQ$는 대칭 tridiagonal matrix다.

$$
PQ=QT+\beta_qq_{q+1}e_q^\top.
$$

여기서 $e_q$는 $q$차원 표준기저의 마지막 vector이다. $\beta_q=0$이면 $q_{q+1}$을 정의할 필요 없이 residual 항을 0으로 둔다. 유한 정밀도에서는 loss of orthogonality 및 near-breakdown을 고려해야 하며, 필요에 따라 reorthogonalization을 사용한다.

### 7.5 Polynomial exactness

**정리.** 정확한 산술에서 $q$차원 Lanczos basis가 생성되었고 $\deg g<q$이면

$$
g(P)r=\|r\|_2Qg(T)e_1.
$$

**증명.** $r=\|r\|_2Qe_1$이고 $T$가 tridiagonal이므로 $T^je_1$은 처음 $j+1$개 entry에서만 0이 아닐 수 있다. 따라서 $j<q-1$에서 $e_q^\top T^je_1=0$이다.

$P^jr=\|r\|_2QT^je_1$이 성립한다고 가정하면,

$$
P^{j+1}r=\|r\|_2(PQ)T^je_1=\|r\|_2QT^{j+1}e_1
$$

이다. 두 번째 등식은 위 Lanczos relation의 residual 항이 사라지기 때문이다. 귀납법으로 $0\le j<q$에서 성립하고 각 항을 선형 결합하면 결과를 얻는다.

- Degree $d$의 polynomial에는 일반적으로 $q=d+1$이 충분하다.
- 이는 항상 필요한 조건은 아니다. $Pr=\lambda r$이면 1차원 invariant subspace만으로 임의 차수의 polynomial action을 정확히 계산할 수 있다.
- Degree $d\ge q$에서는 일반적으로 exactness가 보장되지 않는다.

**반례.** $P=\operatorname{diag}(1,2)$, $r=(1,1)^\top$, $q=1$이면 $T=(1.5)$이다. $g(t)=t$일 때 Lanczos approximation은 $(1.5,1.5)^\top$이지만 실제 $Pr=(1,2)^\top$이다.

이 정리는 Park & Shin의 Mem-GF에서 핵심적으로 사용하는 polynomial action의 성질이다. Algebraic exactness와 floating-point error가 0이라는 주장은 서로 다르다.

### 7.6 Nonpolynomial matrix functions

실대칭 $P$의 spectrum을 포함하는 닫힌 구간 $J$에서 연속인 함수 $g$를 생각하자. $T$의 eigenvalue 역시 $J$ 안에 포함된다. Lanczos approximation은

$$
g(P)r\approx\|r\|_2Qg(T)e_1
$$

로 표현된다. 임의의 $\deg p<q$인 polynomial $p$에 대해 exactness를 이용하면

$$
\begin{aligned}
g(P)r-\|r\|_2Qg(T)e_1
&=(g(P)-p(P))r\\
&\quad-\|r\|_2Q(g(T)-p(T))e_1.
\end{aligned}
$$

Triangle inequality와 spectral theorem에 의해

$$
\|g(P)r-\|r\|_2Qg(T)e_1\|_2\le2\|r\|_2\inf_{\deg p<q}\max_{t\in J}|g(t)-p(t)|.
$$

이 bound는 Krylov approximation의 성능과 polynomial approximation theory의 연결을 보여준다. Exactness theorem이 임의의 함수에 대해 exact computation을 보장하는 것은 아니다. 또한 이 bound는 실제 유한 정밀도 오차를 포함하지 않는다.

### 7.7 Computation과 cache의 trade-off

| 방법 | Full operator 저장 | 추가 vector storage (단일 입력) | 특징 |
|---|---|---|---|
| Explicit dense filtering | $O(m^2)$ | $O(m)$ | 작은 문제의 reference |
| Matrix-free streaming | 불필요 | $O(n+m)$ | 단일 filter의 직접 계산 |
| Shared-power cache | 불필요 | $O(md+n+m)$ | 여러 polynomial의 power 재사용 |
| Lanczos projection | 불필요 | $O(mq+n+m)$ + 작은 projected matrix | Orthogonal basis, Ritz values, matrix-function approximation |

공통의 sparse factor 저장 비용과 library별 workspace는 별도이다. Lanczos의 tridiagonal operator는 $O(q)$로 저장할 수 있지만 dense projected matrix를 생성하는 구현에서는 $O(q^2)$가 필요하다. Full reorthogonalization을 사용하는 경우 연산 비용도 추가된다.

$g(P)r$ 하나를 구할 때 반드시 Krylov projection이 필요한 것은 아니다. Matrix-free recurrence 역시 $P$를 저장하지 않는다. 여러 filter를 비교할 때는 shared-power cache와 비교해야 계산 재사용 효과와 orthogonal projection의 효과를 구별할 수 있다. 전체 user의 basis를 동시에 저장하면 단일 user의 $O(mq)$와 달리 user 수만큼 cache가 증가한다.

---

## 8. Spectral Rescaling and Constrained Filter Design

### 8.1 Normalized Gram matrix의 spectral bound

$R\in\mathbb R^{n\times m}$이 nonnegative interaction matrix이고 모든 row/column degree가 양수라고 하자.

$$
D_r=\operatorname{diag}(R\mathbf1),\qquad D_c=\operatorname{diag}(R^\top\mathbf1),\qquad C=D_r^{-1/2}RD_c^{-1/2}.
$$

$P=C^\top C$의 eigenvalue는 $[0,1]$ 안에 있다.

**증명.** $z_j=x_j/\sqrt{d_{c,j}}$로 놓으면 weighted Cauchy–Schwarz에 의해

$$
\begin{aligned}
\|Cx\|_2^2&=\sum_i\frac{(\sum_j R_{ij}z_j)^2}{d_{r,i}}\\
&\le\sum_i\sum_jR_{ij}z_j^2=\|x\|_2^2.
\end{aligned}
$$

따라서 $\|C\|_2\le1$이고 $C^\top C\succeq0$이므로 결과를 얻는다. 또한 $C\sqrt{d_c}=\sqrt{d_r}$, $C^\top\sqrt{d_r}=\sqrt{d_c}$이므로 비어 있지 않은 graph에서는 최대 singular value가 1이다. 여기서 제곱근은 vector에 element-wise로 적용한다.

Asymmetric normalization $C_\alpha=D_r^{-\alpha}RD_c^{\alpha-1}$에서도 $C_\alpha^\top C_\alpha$는 PSD이지만 최대 eigenvalue가 1 이하라는 bound는 일반적으로 보장되지 않는다.

예를 들어 $R=(1,1)$, $\alpha=0$이면 $C_\alpha=R$이고 $C_\alpha^\top C_\alpha$의 eigenvalue는 0과 2다.

### 8.2 Polynomial의 설계 구간

Frequency 변수 $\lambda\in[0,1]$에서 $h(\lambda)=1-\lambda^2$는 낮은 frequency를 보존한다. 하지만 $\lambda=14$라면 $h(14)=-195$이다. 설계 구간 밖에서는 gain의 절댓값이 크게 증가할 수 있다.

따라서 polynomial의 차수와 coefficient뿐 아니라 적용 대상 operator의 spectrum을 확인해야 한다. Similarity eigenvalue와 Laplacian frequency의 방향은 서로 반대일 수 있으므로 어떤 변수를 기준으로 response를 설계하는지도 중요하다.

### 8.3 Affine spectral transformation

실대칭 $P$에 대해 $\ell=\lambda_{\min}(P)$, $b=\lambda_{\max}(P)$, $\Delta=b-\ell>0$로 놓자.

$$
B=\frac{P-\ell I}{\Delta},\qquad L_*=bI-P=\Delta(I-B).
$$

$B$의 eigenvalue는 $[0,1]$, $L_*$의 eigenvalue는 $[0,\Delta]$에 포함된다. $L_*$는 PSD frequency operator이지만 반드시 degree-based graph Laplacian은 아니다. $P$와 eigenbasis를 공유하고 eigenvalue 순서를 뒤집는다.

Roh et al.의 MM-GF에서 사용하는 filter를 이 표기로 쓰면

$$
F(P)=\sum_{j=1}^K\frac{a_j}{\Delta^{j-1}}(P-\ell I)^j=\Delta p(B),\qquad p(t)=\sum_{j=1}^Ka_jt^j.
$$

$L_*u=\lambda u$이면 $Bu=(1-\lambda/\Delta)u$이므로 frequency response는

$$
h(\lambda)=\Delta p(1-\lambda/\Delta),\qquad 0\le\lambda\le\Delta.
$$

$\Delta=0$이면 $P$가 scalar multiple of identity이므로 비자명한 spectral separation이 없으며 위 normalization을 별도로 처리해야 한다. 근사 eigenvalue를 사용할 경우에도 실제 spectrum을 포함하는 bound인지 확인해야 한다. Ritz extremum만으로는 일반적으로 외부 enclosing bound가 되지 않는다.

### 8.4 Boundedness와 monotonicity의 조건

각 항 $\Delta B^j$의 eigenvalue는 $[0,\Delta]$ 안에 있고 Laplacian frequency에 대한 response는 감소한다. 그러나 이러한 항들의 임의의 linear combination이 같은 성질을 가진다는 보장은 없다.

- $p(t)=2t$이면 $F(P)$의 최대 gain은 $2\Delta$이다.
- $p(t)=t-t^2$이면 중간 frequency에서 gain이 가장 커지는 band-pass 형태를 갖는다.

일반적인 bound는

$$
\|F(P)\|_2\le\Delta\max_{t\in[0,1]}|p(t)|\le\Delta\sum_{j=1}^K|a_j|.
$$

$0\le p(t)\le1$, $p'(t)\ge0$이면 $h(\lambda)$는 비음수이고 $[0,\Delta]$에 제한된 monotone low-pass response이다. Monomial coefficient에 대해 $a_j\ge0$, $\sum_j a_j\le1$은 이를 보장하는 충분조건이다. 필요조건은 아니다.

Roh et al.의 Theorem 4.1을 해석할 때 개별 basis term에 대한 spectral boundedness와 전체 polynomial에 대한 boundedness를 구별해야 한다. 위의 추가 조건과 반례는 이 차이를 확인하기 위한 보충이다.

### 8.5 Bernstein basis와 shape constraint

$$
p(t)=\sum_{j=0}^K b_j\binom Kj t^j(1-t)^{K-j},\qquad t\in[0,1].
$$

Bernstein basis function은 nonnegative이고 합이 1이다. 따라서 $0\le b_j\le1$이면 $0\le p(t)\le1$이 성립한다. 또한

$$
p'(t)=K\sum_{j=0}^{K-1}(b_{j+1}-b_j)\binom{K-1}{j}t^j(1-t)^{K-1-j}.
$$

따라서 $0=b_0\le b_1\le\cdots\le b_K\le1$은 $p(0)=0$과 bounded monotone response를 동시에 보장하는 충분조건이다. Normalized Laplacian의 $[0,2]$ spectrum에서는 $t=\lambda/2$ 또는 원하는 frequency 방향에 맞춘 변수를 사용할 수 있다.

### 8.6 Affine transformation과 polynomial space

$B=(P-\ell I)/\Delta$이고 $\Delta\ne0$이면

$$
\operatorname{span}\{I,P,\ldots,P^K\}=\operatorname{span}\{I,B,\ldots,B^K\}.
$$

양방향 affine relation과 binomial theorem으로 확인할 수 있다. 상수항과 임의의 실수 coefficient를 허용한 경우 spectral rescaling은 표현 가능한 polynomial operator의 공간 자체를 늘리지 않는다.

그러나 상수항을 제거하거나 coefficient 범위를 제한하면 두 parameterization에서 얻는 함수공간이 달라질 수 있다. $p(B)$에 상수항이 없으면 $P$의 eigenvalue $\ell$에서 gain이 0이지만, $p(P)$의 상수항이 없으면 eigenvalue 0에서 gain이 0이기 때문이다. 후자의 eigenvalue가 실제 spectrum에 존재하지 않을 수도 있다.

따라서 rescaling의 효과는 expressivity뿐 아니라 coefficient constraints, conditioning, optimization, search space의 차이로 해석해야 한다.

### 8.7 Affine invariance of Krylov subspaces

같은 관계를 Krylov subspace에 적용하면

$$
\mathcal K_q(P,r)=\mathcal K_q(B,r).
$$

실제로 $B^jr\in\operatorname{span}\{r,Pr,\ldots,P^jr\}$이고 역변환 $P=\Delta B+\ell I$를 적용하면 반대 포함관계도 성립한다.

따라서 $P$에 대한 Lanczos basis $Q$와 $T=Q^\top PQ$가 이미 있다면 동일한 basis에서

$$
T_B=Q^\top BQ=\frac{T-\ell I_q}{\Delta}.
$$

$\deg p<q$라면 정확한 산술에서

$$
F(P)r=\Delta\|r\|_2Qp(T_B)e_1.
$$

즉 고정된 operator와 input에서는 affine spectral transformation 때문에 새로운 Krylov subspace를 구성할 필요가 없다. 단, graph의 edge weight나 구조 자체가 바뀌면 동일한 subspace가 유지된다는 보장은 없다. 이는 Sections 7–8의 기본 성질을 결합한 보충 유도이다.

---
## 9. Applications: Graph-based Recommendation and Beyond

### 9.1 Graph-based regularization과 matrix completion

User–item interaction matrix $R$의 일부 항목만 관측되었다고 하자. 관측 위치의 binary mask가 $M$일 때 복원 문제를 다음과 같이 표현할 수 있다.

$$
\min_X\|M\odot(X-R)\|_F^2+\alpha\operatorname{Tr}(X^\top L_UX)+\beta\operatorname{Tr}(XL_IX^\top).
$$

$L_U$와 $L_I$는 각각 user graph와 item graph의 Laplacian이다. 첫 번째 regularizer는 유사한 user의 interaction pattern을, 두 번째 regularizer는 유사한 item의 interaction pattern을 비슷하게 만든다. Low-rank matrix completion과 graph smoothness regularization은 서로 다른 구조적 가정을 사용한다.

### 9.2 Collaborative filtering as graph filtering

User–item bipartite graph에서 item projection $R^\top R$은 두 item을 함께 이용한 user의 정보를 담는다. 정규화된 interaction $C$로부터 item operator $P=C^\top C$를 구성하면 user $u$의 interaction vector $r_u$에 대해

$$
s_u=g(P)r_u
$$

와 같은 recommendation score를 얻을 수 있다. 여기서는 모든 user signal을 column vector로 통일한다. 이미 관측된 item을 제외하고 높은 score의 item을 선택하면 top-$k$ recommendation이 된다.

- Graph construction: 어떤 co-occurrence를 유사성으로 해석할 것인가?
- Filter design: 직접 이웃과 여러 hop을 어떤 비율로 반영할 것인가?
- Numerical computation: 이 score를 얼마나 적은 시간과 메모리로 계산할 수 있는가?

고정된 polynomial과 graph를 사용하는 training-free 방식은 iterative gradient-based parameter training이 필요하지 않다. 그러나 graph construction, hyperparameter validation, feature extraction 등의 비용까지 없어지는 것은 아니다. Mem-GF와 MM-GF는 이러한 graph filtering 기반 recommendation의 예다.

### 9.3 Hadamard power와 graph construction

Element-wise power $C^{\circ s}$와 matrix power $C^s$는 다른 연산이다. Item projection에서 다음 두 operator도 일반적으로 다르다.

$$
P_{\mathrm{before}}=(C^{\circ s})^\top C^{\circ s},\qquad P_{\mathrm{after}}=(C^\top C)^{\circ s}.
$$

비음수 $C$와 $s>0$에 대해 각 entry는

$$
(P_{\mathrm{before}})_{ij}=\sum_u(C_{ui}C_{uj})^s,
$$

$$
(P_{\mathrm{after}})_{ij}=\left(\sum_u C_{ui}C_{uj}\right)^s.
$$

$s=1$이면 항상 일치하지만 다른 $s$에서 일치하는 것은 보장되지 않는다.

**반례.** $C=\begin{pmatrix}1&1\\1&1\end{pmatrix}$, $s=2$이면 $P_{\mathrm{before}}$의 모든 entry는 2, $P_{\mathrm{after}}$의 모든 entry는 4이다. 반면 $C=I$처럼 모든 양의 $s$에서 일치하는 경우도 존재한다.

Projection 이전에 power를 적용하면 Gram factorization이 유지되므로 $P_{\mathrm{before}}x=(C^{\circ s})^\top(C^{\circ s}x)$로 계산할 수 있다. Projection 이후에 power를 적용한 operator에는 같은 식을 사용할 수 없다.

양의 정수 $s$에서는 Schur product theorem으로 $P_{\mathrm{after}}$가 PSD임을 알 수 있다. 열벡터 $c_i$의 tensor power를 이용하면

$$
\langle c_i^{\otimes s},c_j^{\otimes s}\rangle=\langle c_i,c_j\rangle^s
$$

가 성립하지만, lifted dimension이 매우 커질 수 있다. Fractional power에서는 PSD 자체도 일반적으로 보장되지 않으며, 원래 factor를 그대로 사용한 효율적 matrix-free 표현이 따라오지 않는다. 특정 결과 행렬이 PSD이면 유한 차원 Gram factorization은 존재한다는 점과 구별해야 한다.

Mem-GF는 projection 이전, MM-GF는 projection 이후에 power를 적용한다. 따라서 한 방법의 factorization을 다른 방법에 그대로 적용하는 것은 계산 알고리즘만 바꾸는 것이 아니라 일반적으로 graph operator를 변경하는 것이다.

### 9.4 Multimodal graph construction

Interaction 이외에 text, image 등의 feature가 있으면 modality별 item relation을 구성할 수 있다. 예를 들어 feature $x_i^{(a)}$에서 cosine similarity를 계산한다.

$$
S_{ij}^{(a)}=\frac{\langle x_i^{(a)},x_j^{(a)}\rangle}{\|x_i^{(a)}\|_2\|x_j^{(a)}\|_2}.
$$

MM-GF에서는 각 행의 top-$k$ neighbor를 남기고 binarize한 뒤 degree normalization과 Gram projection, Hadamard adjustment를 적용한다. Row-wise kNN은 directed일 수 있지만 $C_aC_a^\top$는 symmetric이며 공통 이웃의 정보를 반영한다. Zero vector, tie, self-neighbor, zero degree 등의 처리 규칙이 필요하다. kNN 결과가 sparse여도 그 projection은 dense할 수 있다.

Modality별 filtering 결과를 결합하면

$$
s_u=\sum_a w_a g_a(P_a)r_u.
$$

서로 다른 $P_a$는 공통 eigenbasis를 공유할 필요가 없다. 실대칭 operator들의 simultaneous orthogonal diagonalization은 pairwise commutation과 동치이다. 따라서 일반적으로 서로 다른 graph의 scalar frequency response를 단순히 더할 수 없다.

또한 filter output을 더하는 것과 graph를 먼저 합친 뒤 filtering하는 것은 다르다. 예를 들어 $(P_1+P_2)^2$에는 $P_1P_2+P_2P_1$이라는 cross term이 생긴다. Modality weight를 해석할 때 각 operator의 scale과 input signal에 대한 실제 output norm도 고려해야 한다.

### 9.5 Spectral energy와 ranking

실대칭 $P=U\Lambda U^\top$, $r_u=\sum_i c_{ui}u_i$라고 하면 filter 근사오차는

$$
\|(g(P)-f(P))r_u\|_2^2=\sum_i |g(\lambda_i)-f(\lambda_i)|^2|c_{ui}|^2.
$$

같은 operator를 사용해도 input별 spectral energy가 다르기 때문에 같은 filter approximation에서 발생하는 action error는 달라질 수 있다.

Recommendation에서 필요한 것은 항상 score의 완전한 일치가 아니라 top-$k$ 집합의 일치일 수 있다. 정확한 score vector $s$의 내림차순 정렬값을 $s_{(j)}$로 쓰고 $\delta_k=s_{(k)}-s_{(k+1)}>0$이라 하자. 그러면

$$
\|\widehat s-s\|_\infty<\frac{\delta_k}{2}\quad\Longrightarrow\quad \operatorname{TopK}(\widehat s)=\operatorname{TopK}(s).
$$

**증명.** 정확한 top-$k$에 속하는 item $i$와 그 밖의 item $j$에 대해 $s_i-s_j\ge\delta_k$이다. $\varepsilon=\|\widehat s-s\|_\infty$라 두면 $\widehat s_i-\widehat s_j\ge\delta_k-2\varepsilon>0$이므로 집합이 보존된다. 집합 내부 순서까지 보존한다는 뜻은 아니다. 실제 계산에서 정확한 margin을 모를 경우에는 인증된 오차 상한과 근사 score의 margin을 사용해야 한다.

### 9.6 Other applications

| Task | Graph filtering의 역할 | 필요한 가정 |
|---|---|---|
| Denoising / interpolation | Smoothness regularization, Wiener filtering | Signal과 noise model의 적합성 |
| Semi-supervised classification | Label propagation | Relation에 label 예측 정보가 존재 |
| Spectral clustering | Low-frequency subspace 추출 | 의미 있는 graph partition |
| Multivariate forecasting | 시계열 간 관계를 통한 propagation | Dependency와 예측 시점의 정보 가용성 |
| Graph-based Gaussian process | Multi-output covariance 구조화 | Graph와 covariance의 적합성 |
| Point cloud / mesh | Local smoothing 및 high-variation feature 추출 | Geometry의 보존 |

예를 들어 semi-supervised classification에서 관측 label을 one-hot matrix $X$로 만들고 미관측 label의 행을 0으로 두면 $Y=g(S)X$로 class별 score를 전파할 수 있다. 이는 supervised loss나 별도 mask 처리 없이 항상 정확히 분류된다는 뜻은 아니다.

Graph-based GP에서는 $y(x)=H(S)f(x)+\epsilon$로 multi-output covariance를 구조화할 수 있다. Latent output의 covariance가 $k(x,x')I$라면 filtering된 latent covariance는 $k(x,x')H(S)H(S)^\top$이며 관측 noise covariance는 별도로 더한다.

Dynamic graph에서는 시간에 따라 $S_t$가 바뀐다. Eigenbasis 또는 node set이 달라질 수 있으므로 각 시점의 spectral coordinate를 같은 의미로 비교할 수 있는지 주의해야 한다.

---

## 10. Evaluation and Model Selection

### 10.1 Graph, filter, computation의 분리

Graph filtering 기반 모델은 다음 세 요소로 구분할 수 있다.

$$
\boxed{\quad P_a\quad\longrightarrow\quad g_a(P_a)\quad\longrightarrow\quad g_a(P_a)r\quad}
$$

| 요소 | 결정하는 내용 |
|---|---|
| Graph construction | 어떤 관계를 operator로 표현하는가? |
| Filter design | 어떤 spectral mode에 어떤 gain을 부여하는가? |
| Numerical computation | 동일한 operator action을 어떻게 계산하는가? |

Polynomial basis가 바뀌어도 동일한 함수와 operator를 표현할 수 있다. 반면 graph가 바뀌면 일반적으로 모델 자체가 달라진다. 계산 알고리즘만 바꾸고 정확한 산술에서 같은 operator action을 구한다면 예측값은 동일하다. 이러한 구별은 성능 향상의 원인을 해석하는 데 중요하다.

### 10.2 Baseline과 ablation

- Graph-free baseline: graph를 추가하는 것이 실제로 도움이 되는지 확인한다.
- Graph ablation: 원래 graph, 개별 relation, random 또는 degree-controlled graph를 비교한다.
- Filter ablation: 고정 low-pass, learnable polynomial, multi-band filtering을 비교한다.
- Numerical baseline: 동일한 $P,g,r$를 사용하고 계산 알고리즘만 비교한다.

비교할 때 data split, 입력 feature, tuning budget, 계산 자원을 가능한 한 동일하게 설정한다. 같은 결과가 나왔다고 모든 조건에서 알고리즘이 동등한 것은 아니며, 다른 결과가 나왔다고 수학적으로 더 표현력이 높다는 뜻도 아니다.

### 10.3 Data leakage와 protocol

Graph learning에서 특히 주의할 점은 graph construction 자체가 데이터를 이용하는 과정이라는 것이다.

- 미래 관측값을 현재 prediction의 normalization이나 edge 생성에 사용하지 않는다.
- Held-out interaction 또는 label을 graph 생성 및 hyperparameter 선택에 사용하지 않는다. 단, 명시된 transductive protocol에서 unlabeled test-node feature와 edge를 이용하는 것은 별개의 문제다.
- 중복 node 또는 sample이 train/test split을 가로질러 포함되었는지 확인한다.
- 결정론적 모델도 data split과 hyperparameter 선택에 따라 결과가 달라질 수 있다.

Bo et al.이 정리한 benchmark와 Gong et al.이 소개하는 후속 heterophily 평가에서는 이러한 protocol 차이가 중요하다. 특정 benchmark의 성능 순위를 보편적 모델 우월성으로 해석해서는 안 된다.

### 10.4 정확도와 계산 비용

| 측정 항목 | 의미 |
|---|---|
| Accuracy / RMSE | Prediction의 품질 |
| Recall@k / NDCG@k | 관련 item의 검색 및 순위 품질 |
| Score error | 계산 결과의 수치적 정확성 |
| Preprocessing / training time | Graph 및 모델 준비 비용 |
| Inference time | 준비 이후 예측의 비용 |
| Peak memory | 실행 중 최대 메모리 사용량 |
| Persistent cache | 반복 계산을 위해 저장하는 자료의 크기 |

서로 다른 metric은 서로를 대체하지 못한다. 예를 들어 정확한 filter action은 잘못 설계한 filter의 예측 성능을 개선하지 않으며, 같은 ranking은 score가 정확히 일치한다는 증거가 아니다. 단일 filter workload와 여러 filter의 반복 평가에서도 최적의 계산 전략은 달라질 수 있다.

### 10.5 개념 지도

| 관찰된 문제 | 먼저 확인할 개념 |
|---|---|
| Graph model이 graph-free model보다 좋지 않음 | Relation alignment, graph construction, evaluation protocol |
| 단순 smoothing이 정보를 제거함 | Spectral energy, heterophily, hop-specific propagation |
| Node 구별에 구조적 정보가 부족함 | Positional encoding, WL expressiveness |
| Graph 변화에 출력이 민감함 | Perturbation bound, transferability |
| Polynomial gain이 폭주함 | Spectral interval, coefficient bound, numerical conditioning |
| Operator가 너무 커서 저장할 수 없음 | Sparse factorization, matrix-free multiplication |
| 여러 filter를 반복해서 계산함 | Power cache, Krylov projection, amortized cost |

Graph를 활용한다는 것은 이웃 정보를 무조건 평균한다는 뜻이 아니다. 문제에 필요한 관계를 선택하고, 유용한 성분을 보존하는 operator를 설계한 다음, 그 연산을 정확하고 효율적으로 계산하는 것이 핵심이다.

---

## 11. References

대표 모델의 분류는 아래 서베이를 따른다. 본문의 증명과 예시는 개념 사이의 수학적 연결을 설명하며, 특정 논문의 방법을 설명하는 곳에는 해당 논문을 명시했다.

### Textbooks and lecture notes

1. Ick Hoon Jin. *STA4117 Lecture Note: Network Data Analysis*. Yonsei University. Ch. 1–6.
2. Mark Newman (2018). *Networks*, 2nd ed. Oxford University Press. [DOI](https://doi.org/10.1093/oso/9780198805090.001.0001). Ch. 6–7, 10–14, 17–18.
3. Konstantin Avrachenkov and Maximilien Dreveton (2022). *Statistical Analysis of Networks*. Now Publishers. [DOI](https://doi.org/10.1561/9781638280514). Ch. 2–6.
4. William L. Hamilton (2020). *Graph Representation Learning*. [Book page](https://www.cs.mcgill.ca/~wlh/grl_book/). Ch. 1–7 (특히 Ch. 2, 5–7).

### Surveys

5. Elvin Isufi, Fernando Gama, David I. Shuman and Santiago Segarra (2024). *Graph Filters for Signal Processing and Machine Learning on Graphs*. [arXiv:2211.08854](https://arxiv.org/abs/2211.08854). Sections II–XII.
6. Deyu Bo et al. (2023). *A Survey on Spectral Graph Neural Networks*. [arXiv:2302.05631](https://arxiv.org/abs/2302.05631v1). v1, Sections 1–4.
7. Chenghua Gong et al. (2024 revision). *A Survey on Learning from Graphs with Heterophily: Recent Advances and Future Directions*. [arXiv:2401.09769](https://arxiv.org/abs/2401.09769v4). v4, Sections 4–7, 9.

### Research papers

8. Jin-Duk Park and Won-Yong Shin (2026). *Memory Is No Longer a Bottleneck: Memory-Efficient Graph Filtering for Scalable Collaborative Filtering*. [arXiv:2606.21540](https://arxiv.org/abs/2606.21540v1). v1, Algorithm 1 and Theorem IV.1. Preprint.
9. Yu-Seung Roh, Joo-Young Kim, Jin-Duk Park and Won-Yong Shin (2026). *Training-free Adjustable Polynomial Graph Filtering for Ultra-fast Multimodal Recommendation*. [arXiv:2503.04406](https://arxiv.org/abs/2503.04406v3). v3, Sections 3–5, Algorithm 1 and Theorem 4.1. Preprint.

### Source map

| Section | 주요 참고 자료 |
|---|---|
| 1. Network Science | STA4117, Newman, Avrachenkov & Dreveton |
| 2. Spectral Graph Theory | Newman, Avrachenkov & Dreveton, Hamilton, Isufi |
| 3. Graph Signal Processing | Isufi §§III–VII, Bo §3.1 |
| 4. Representation Learning | Hamilton Ch. 1–7, Isufi §VIII |
| 5. Spectral Architectures | Bo §§3.1–3.3, Hamilton Ch. 7, Isufi §§III–V |
| 6. Heterophily | Gong §§4–7, Bo §3.5 |
| 7. Numerical Methods | Isufi §§III–VI, Park §IV |
| 8. Spectral Rescaling | Roh §4, Isufi §V, Bo §3.1, Park §IV |
| 9. Applications | Isufi §§IX–X, Park, Roh |
| 10. Evaluation | Hamilton Ch. 6, Bo §3.5, Gong §4, Isufi §§XI–XII |

*문헌 정리와 초안 작성에 AI를 활용했다.*
