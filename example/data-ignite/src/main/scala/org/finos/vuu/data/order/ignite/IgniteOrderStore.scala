package org.finos.vuu.data.order.ignite

import org.apache.ignite.cache.CachePeekMode
import org.apache.ignite.cache.query.{IndexQuery, IndexQueryCriteriaBuilder, SqlFieldsQuery}
import org.apache.ignite.cluster.ClusterState
import org.apache.ignite.{IgniteCache, Ignition}
import org.finos.vuu.data.order.{ChildOrder, OrderStore, ParentOrder}

import scala.collection.mutable
import scala.jdk.CollectionConverters.CollectionHasAsScala
import scala.jdk.javaapi.CollectionConverters.asJava

object IgniteOrderStore {

  /**
   * Creates an instance of IgniteOrderStore
   *
   * @param clientMode defines whether the node is a client or a server that is, if cluster node keeps cache data in current jvm or not
   * @return an instance of IgniteOrderStore
   */
  def apply(clientMode: Boolean = true, persistenceEnabled: Boolean = false): IgniteOrderStore = {
    IgniteLocalConfig.setPersistenceEnabled(persistenceEnabled)
    val config = IgniteLocalConfig.create(clientMode = clientMode)
    val ignite = Ignition.getOrStart(config)

    ignite.cluster().state(ClusterState.ACTIVE)

    val parentOrderCache = ignite.getOrCreateCache[Int, ParentOrder](IgniteLocalConfig.parentOrderCacheName)
    val childOrderCache = ignite.getOrCreateCache[Int, ChildOrder](IgniteLocalConfig.childOrderCacheName)

    new IgniteOrderStore(parentOrderCache, childOrderCache)
  }
}

class IgniteOrderStore(private val parentOrderCache: IgniteCache[Int, ParentOrder],
                       private val childOrderCache: IgniteCache[Int, ChildOrder]) extends OrderStore {


  def storeParentOrder(parentOrder: ParentOrder): Unit = {
    parentOrderCache.put(parentOrder.id, parentOrder)
  }

  def storeChildOrder(parentOrder: ParentOrder, childOrder: ChildOrder): Unit = {
    storeParentOrder(parentOrder)
    childOrderCache.put(childOrder.id, childOrder)
  }

  def storeParentOrderWithChildren(parentOrder: ParentOrder, childOrders: Iterable[ChildOrder]): Unit = {
    storeParentOrder(parentOrder)

    val localCache = mutable.Map.empty[Int, ChildOrder]
    childOrders.foreach(order => localCache(order.id) = order)

    childOrderCache.putAll(asJava(localCache))
  }

  def findParentOrderById(id: Int): ParentOrder = {
    parentOrderCache.get(id)
  }

  def findChildOrderByParentId(parentId: Int): Iterable[ChildOrder] = {
    val query: IndexQuery[Int, ChildOrder] = new IndexQuery[Int, ChildOrder](classOf[ChildOrder])

    val criterion = IndexQueryCriteriaBuilder.eq("parentId", parentId)
    query.setCriteria(criterion)
    childOrderCache.query(query)
      .getAll.asScala
      .map(x => x.getValue)
  }

  // todo - make it metadata aware and extract to another class.
  private def toChildOrder(cols: java.util.List[_]): ChildOrder = {
    ChildOrder(
      parentId = cols.get(0).asInstanceOf[Int],
      id = cols.get(1).asInstanceOf[Int],
      ric = cols.get(2).asInstanceOf[String],
      price = cols.get(3).asInstanceOf[Double],
      quantity = cols.get(4).asInstanceOf[Int],
      side = cols.get(5).asInstanceOf[String],
      account = cols.get(6).asInstanceOf[String],
      strategy = cols.get(7).asInstanceOf[String],
      exchange = cols.get(8).asInstanceOf[String],
      ccy = cols.get(9).asInstanceOf[String],
      volLimit = cols.get(10).asInstanceOf[Double],
      filledQty = cols.get(11).asInstanceOf[Int],
      openQty = cols.get(12).asInstanceOf[Int],
      averagePrice = cols.get(13).asInstanceOf[Double],
      status = cols.get(14).asInstanceOf[String]
    )
  }

  def parentOrderCount(): Long = {
    parentOrderCache.sizeLong(CachePeekMode.ALL)
  }

  def childOrderCount(): Long = {
    childOrderCache.sizeLong(CachePeekMode.ALL)
  }

  def findWindow(startIndex: Long, rowCount: Int): Iterable[ChildOrder] = {
    val query = childOrderCache.query(new SqlFieldsQuery(s"select * from ChildOrder limit $rowCount offset $startIndex"))

    val buffer = mutable.ListBuffer[ChildOrder]()
    query.forEach(item => buffer.addOne(toChildOrder(item)))

    buffer
  }
}